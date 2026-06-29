'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { Alert, Button, Modal, Upload } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import {
  CREATE_DOCUMENT,
  PROCESS_DOCUMENT,
  type CreateDocumentData,
  type CreateDocumentVariables,
  type ProcessDocumentData,
  type ProcessDocumentVariables,
  type ProcessedDocument,
} from '../graphql/mutations'

// TODO: Replace with dynamic vault ID when vault management is implemented
const VAULT_ID = '8ae1e229-603c-451d-b454-16b9edddd2bb'

interface UploadApiResponse {
  storageUrl: string
  filename: string
  fileType: string
}

function isAllowedFileType(file: File): boolean {
  const allowedMimeTypes = ['application/pdf', 'text/plain']
  const allowedExtensions = ['.pdf', '.txt']
  return (
    allowedMimeTypes.includes(file.type) ||
    allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  )
}

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (doc: ProcessedDocument) => void
}

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const t = useTranslations()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [createDocument] = useMutation<CreateDocumentData, CreateDocumentVariables>(CREATE_DOCUMENT)
  const [processDocument] = useMutation<ProcessDocumentData, ProcessDocumentVariables>(
    PROCESS_DOCUMENT,
  )

  const handleClose = () => {
    if (isLoading) return
    setUploadError(null)
    setFileList([])
    onClose()
  }

  const handleFileChange: UploadProps['onChange'] = ({ fileList: updated }) => {
    setFileList(updated)
  }

  const handleBeforeUpload = (file: File): string | boolean => {
    if (!isAllowedFileType(file)) {
      setUploadError(t('uploadModalErrorInvalidFileType'))
      return Upload.LIST_IGNORE
    }
    setUploadError(null)
    return false
  }

  const handleUploadAndProcess = async () => {
    const rawFile = fileList[0]?.originFileObj
    if (!rawFile) {
      setUploadError(t('uploadModalErrorNoFileSelected'))
      return
    }

    setIsLoading(true)
    setUploadError(null)

    try {
      // Step 1: Upload file to Vercel Blob via REST
      const formData = new FormData()
      formData.append('file', rawFile)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const uploadRes = await fetch(`${apiUrl}upload`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error(
          t('uploadModalErrorUploadFailed', { status: uploadRes.status, statusText: uploadRes.statusText }),
        )
      }

      const uploadData: UploadApiResponse = await uploadRes.json()

      // Step 2: Register the document in the database
      const createRes = await createDocument({
        variables: {
          // TODO: Replace with dynamic vault ID when vault management is implemented
          vaultId: VAULT_ID,
          filename: uploadData.filename,
          fileType: uploadData.fileType,
          storageUrl: uploadData.storageUrl,
        },
      })

      const documentId = createRes.data?.createDocument.id
      if (!documentId) {
        throw new Error(t('uploadModalErrorNoDocumentId'))
      }

      // Step 3: Extract text and chunk the document
      const processRes = await processDocument({
        variables: { id: documentId },
      })

      const processed = processRes.data?.processDocument
      if (!processed) {
        throw new Error(t('uploadModalErrorNoProcessResponse'))
      }

      setFileList([])
      onSuccess(processed)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('uploadModalErrorUnexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={t('uploadModalTitle')}
      open={open}
      onCancel={handleClose}
      footer={null}
      mask={{ closable: !isLoading }}
    >
      <Upload.Dragger
        accept=".txt,.pdf"
        maxCount={1}
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onChange={handleFileChange}
        style={{ marginBottom: '1rem' }}
      >
        <p>{t('uploadModalDraggerText')}</p>
        <p style={{ color: '#888', fontSize: '0.875rem' }}>{t('uploadModalDraggerHint')}</p>
      </Upload.Dragger>

      {uploadError && (
        <Alert
          type="error"
          title={uploadError}
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Button
        type="primary"
        block
        loading={isLoading}
        disabled={fileList.length === 0}
        onClick={handleUploadAndProcess}
      >
        {t('uploadModalSubmitButton')}
      </Button>
    </Modal>
  )
}
