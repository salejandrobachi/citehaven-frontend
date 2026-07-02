'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Button, Empty, Spin, Tag, Typography, theme } from 'antd'
import { FileTextOutlined, FilePdfOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons'
import { AppLayout } from '@/shared/components/AppLayout'
import { UploadModal } from './components/UploadModal'
import { DocumentViewerModal } from './components/DocumentViewerModal'
import {
  DOCUMENTS_QUERY,
  type Document,
  type DocumentsData,
  type DocumentsVariables,
  type ProcessedDocument,
} from './graphql/mutations'

const { Title, Text } = Typography

const VAULT_TITLE_KEY = 'citehaven-vault-title'
const VAULT_ID_KEY = 'citehaven-vault-id'

function getVaultId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VAULT_ID_KEY)
}

function DocumentCard({ doc, onClick }: { doc: Document; onClick: (doc: Document) => void }) {
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)
  const isPdf = doc.fileType?.toLowerCase().includes('pdf')

  return (
    <div
      onClick={() => onClick(doc)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: token.colorBgContainer,
        border: `1px solid ${hovered ? token.colorPrimary : token.colorBorderSecondary}`,
        borderRadius: 12,
        padding: '20px 20px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        boxShadow: hovered
          ? `0 4px 20px rgba(0,0,0,0.10), 0 0 0 1px ${token.colorPrimary}`
          : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 3,
          background: token.colorPrimary,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 0.2s',
          borderRadius: '12px 12px 0 0',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `${token.colorPrimary}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: token.colorPrimary,
            flexShrink: 0,
          }}
        >
          {isPdf ? <FilePdfOutlined /> : <FileTextOutlined />}
        </div>
        <Tag
          color={doc.status === 'processed' ? 'success' : doc.status === 'processing' ? 'processing' : 'default'}
          style={{ marginTop: 2 }}
        >
          {doc.status}
        </Tag>
      </div>

      <Text
        strong
        style={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 14,
          color: token.colorText,
        }}
        title={doc.filename}
      >
        {doc.filename}
      </Text>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(doc.createdAt).toLocaleDateString()}
        </Text>
        <span style={{ fontSize: 12, color: token.colorPrimary, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <EyeOutlined /> Ver
        </span>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const t = useTranslations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [vaultTitle] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(VAULT_TITLE_KEY)
  })
  const [vaultId] = useState<string | null>(getVaultId)

  const { data, loading, refetch } = useQuery<DocumentsData, DocumentsVariables>(DOCUMENTS_QUERY, {
    variables: { where: { vaultId: vaultId ?? '' } },
    skip: !vaultId,
    fetchPolicy: 'network-only',
  })

  const handleSuccess = (doc: ProcessedDocument) => {
    setIsModalOpen(false)
    refetch()
    void doc
  }

  const documents = data?.documents ?? []

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {vaultTitle ?? t('documentsTitle')}
          </Title>
          {vaultTitle && (
            <Text type="secondary" style={{ fontSize: 13 }}>{t('documentsTitle')}</Text>
          )}
        </div>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)}>
          {t('documentsUploadButton')}
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : documents.length === 0 ? (
        <Empty description={t('documentsEmpty')}>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            {t('documentsUploadButton')}
          </Button>
        </Empty>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onClick={setViewingDoc} />
          ))}
        </div>
      )}

      <UploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <DocumentViewerModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </AppLayout>
  )
}
