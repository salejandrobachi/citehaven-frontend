'use client'

import { useEffect, useState } from 'react'
import { Alert, Button, Modal, Space, Spin, Typography } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { getAuth } from '@/lib/auth'
import type { Document as Doc } from '../graphql/mutations'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const { Text } = Typography

function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<Spin size="large" />}
        error={<Text type="danger">No se pudo cargar el PDF.</Text>}
      >
        <Page pageNumber={page} width={680} renderTextLayer renderAnnotationLayer />
      </Document>
      {numPages > 1 && (
        <Space>
          <Button icon={<LeftOutlined />} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} />
          <Text>{page} / {numPages}</Text>
          <Button icon={<RightOutlined />} disabled={page >= numPages} onClick={() => setPage((p) => p + 1)} />
        </Space>
      )}
    </div>
  )
}

function TxtViewer({ text }: { text: string }) {
  return (
    <pre
      style={{
        background: 'var(--ant-color-fill-quaternary, #f5f5f5)',
        padding: 16,
        borderRadius: 8,
        overflow: 'auto',
        maxHeight: 560,
        fontSize: 13,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
      }}
    >
      {text}
    </pre>
  )
}

function FallbackViewer({ url }: { url: string }) {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        Vista previa no disponible para este tipo de archivo.
      </Text>
      <Button type="primary" href={url} target="_blank" rel="noopener noreferrer">
        Abrir en nueva pestaña
      </Button>
    </div>
  )
}

interface Props {
  doc: Doc | null
  onClose: () => void
}

export function DocumentViewerModal({ doc, onClose }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!doc) return

    const lower = doc.fileType?.toLowerCase() ?? ''
    const name = doc.filename?.toLowerCase() ?? ''
    const isPdfDoc = lower.includes('pdf') || name.endsWith('.pdf')
    const isTxtDoc = !isPdfDoc && (lower.includes('text') || lower.includes('plain') || name.endsWith('.txt'))

    let cancelled = false
    let blobUrl: string | null = null

    setObjectUrl(null)
    setTextContent(null)
    setError(null)
    setLoading(true)

    const auth = getAuth()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''

    fetch(`${apiUrl}document/${doc.id}/content`, {
      headers: auth ? { Authorization: `Bearer ${auth.token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
        return res.blob()
      })
      .then(async (blob) => {
        if (cancelled) return
        if (isTxtDoc) {
          const text = await blob.text()
          if (!cancelled) setTextContent(text)
        } else {
          blobUrl = URL.createObjectURL(blob)
          if (!cancelled) setObjectUrl(blobUrl)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar el documento.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [doc])

  if (!doc) return null

  const lower = doc.fileType?.toLowerCase() ?? ''
  const name = doc.filename?.toLowerCase() ?? ''
  const isPdf = lower.includes('pdf') || name.endsWith('.pdf')
  const isTxt = !isPdf && (lower.includes('text') || lower.includes('plain') || name.endsWith('.txt'))

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      title={doc.filename}
      width={760}
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', padding: '16px 24px' } }}
      destroyOnHidden
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      )}
      {!loading && error && <Alert type="error" message={error} showIcon />}
      {!loading && !error && isPdf && objectUrl && <PdfViewer url={objectUrl} />}
      {!loading && !error && isTxt && textContent !== null && <TxtViewer text={textContent} />}
      {!loading && !error && !isPdf && !isTxt && objectUrl && <FallbackViewer url={objectUrl} />}
    </Modal>
  )
}
