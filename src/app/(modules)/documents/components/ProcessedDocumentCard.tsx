'use client'

import { useTranslations } from 'next-intl'
import { Card, Typography } from 'antd'

const { Text } = Typography

interface ProcessedDocumentCardProps {
  id: string
  status: string
  filename: string
}

export function ProcessedDocumentCard({ filename, status }: ProcessedDocumentCardProps) {
  const t = useTranslations()

  return (
    <Card
      title={t('documentCardTitle')}
      style={{ marginTop: '2rem', width: '100%', maxWidth: '480px' }}
    >
      <Text strong>{t('documentCardFilename')}: </Text>
      <Text>{filename}</Text>
      <br />
      <Text strong>{t('documentCardStatus')}: </Text>
      <Text>{status}</Text>
    </Card>
  )
}
