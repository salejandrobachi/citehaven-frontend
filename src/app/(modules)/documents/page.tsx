'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button, Typography } from 'antd'
import { AppLayout } from '@/shared/components/AppLayout'
import { UploadModal } from './components/UploadModal'
import { ProcessedDocumentCard } from './components/ProcessedDocumentCard'
import type { ProcessedDocument } from './graphql/mutations'

const { Title, Text } = Typography

export default function DocumentsPage() {
  const t = useTranslations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastProcessed, setLastProcessed] = useState<ProcessedDocument | null>(null)

  const handleSuccess = (doc: ProcessedDocument) => {
    setLastProcessed(doc)
    setIsModalOpen(false)
  }

  return (
    <AppLayout>
      <Title level={2}>{t('documentsTitle')}</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '2rem' }}>
        {t('documentsSubtitle')}
      </Text>

      <Button type="primary" size="large" onClick={() => setIsModalOpen(true)}>
        {t('documentsUploadButton')}
      </Button>

      {lastProcessed && (
        <ProcessedDocumentCard
          id={lastProcessed.id}
          status={lastProcessed.status}
          filename={lastProcessed.filename}
        />
      )}

      <UploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  )
}
