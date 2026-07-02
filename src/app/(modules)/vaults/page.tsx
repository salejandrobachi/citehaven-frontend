'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Typography,
  theme,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/shared/components/AppLayout'
import {
  CREATE_VAULT_MUTATION,
  DELETE_VAULT_MUTATION,
  UPDATE_VAULT_MUTATION,
  VAULTS_QUERY,
  type CreateVaultData,
  type CreateVaultVariables,
  type DeleteVaultData,
  type DeleteVaultVariables,
  type UpdateVaultData,
  type UpdateVaultVariables,
  type Vault,
  type VaultsData,
} from '@/shared/graphql/auth'

const { Title, Text } = Typography

const VAULT_ID_KEY = 'citehaven-vault-id'
const VAULT_TITLE_KEY = 'citehaven-vault-title'

interface VaultCardProps {
  vault: Vault
  onEnter: (vault: Vault) => void
  onEdit: (vault: Vault) => void
  onDelete: (id: string) => void
}

function VaultCard({ vault, onEnter, onEdit, onDelete }: VaultCardProps) {
  const t = useTranslations()
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('vaultsEditButton'),
      onClick: () => onEdit(vault),
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title={t('vaultsDeleteConfirm')}
          onConfirm={() => onDelete(vault.id)}
          okText={t('vaultsDeleteOk')}
          cancelText={t('vaultsDeleteCancel')}
          okButtonProps={{ danger: true }}
        >
          <span style={{ color: token.colorError }}>{t('vaultsDeleteButton')}</span>
        </Popconfirm>
      ),
      danger: true,
    },
  ]

  return (
    <div
      onClick={() => onEnter(vault)}
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
      }}
    >
      {/* accent bar top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: token.colorPrimary,
          opacity: hovered ? 1 : 0.45,
          transition: 'opacity 0.2s',
          borderRadius: '12px 12px 0 0',
        }}
      />

      {/* 3-dot menu */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 10, right: 10 }}
      >
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            style={{ color: token.colorTextSecondary }}
          />
        </Dropdown>
      </div>

      {/* icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${token.colorPrimary}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          fontSize: 22,
          color: token.colorPrimary,
          transition: 'background 0.2s',
        }}
      >
        <FolderOutlined />
      </div>

      <Text
        strong
        style={{
          fontSize: 15,
          display: 'block',
          marginBottom: 6,
          color: token.colorText,
          paddingRight: 28,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {vault.title}
      </Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {t('vaultsCreatedAt', { date: new Date(vault.createdAt).toLocaleDateString() })}
      </Text>
    </div>
  )
}

export default function VaultsPage() {
  const t = useTranslations()
  const router = useRouter()

  const [createOpen, setCreateOpen] = useState(false)
  const [editVault, setEditVault] = useState<Vault | null>(null)
  const [createForm] = Form.useForm<{ title: string }>()
  const [editForm] = Form.useForm<{ title: string }>()

  const { data, loading, refetch } = useQuery<VaultsData>(VAULTS_QUERY, {
    fetchPolicy: 'network-only',
  })

  const [createVault, { loading: creating }] = useMutation<CreateVaultData, CreateVaultVariables>(
    CREATE_VAULT_MUTATION,
  )
  const [updateVault, { loading: updating }] = useMutation<UpdateVaultData, UpdateVaultVariables>(
    UPDATE_VAULT_MUTATION,
  )
  const [deleteVault] = useMutation<DeleteVaultData, DeleteVaultVariables>(DELETE_VAULT_MUTATION)

  const handleEnter = (vault: Vault) => {
    localStorage.setItem(VAULT_ID_KEY, vault.id)
    localStorage.setItem(VAULT_TITLE_KEY, vault.title)
    router.push('/documents')
  }

  const handleCreate = async (values: { title: string }) => {
    await createVault({ variables: { title: values.title } })
    createForm.resetFields()
    setCreateOpen(false)
    refetch()
  }

  const handleEdit = async (values: { title: string }) => {
    if (!editVault) return
    await updateVault({ variables: { id: editVault.id, title: values.title } })
    setEditVault(null)
    editForm.resetFields()
    refetch()
  }

  const handleDelete = async (id: string) => {
    await deleteVault({ variables: { id } })
    if (localStorage.getItem(VAULT_ID_KEY) === id) {
      localStorage.removeItem(VAULT_ID_KEY)
      localStorage.removeItem(VAULT_TITLE_KEY)
    }
    refetch()
  }

  const vaults = data?.vaults ?? []

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {t('vaultsTitle')}
          </Title>
          <Text type="secondary">{t('vaultsSubtitle')}</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          {t('vaultsCreateButton')}
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : vaults.length === 0 ? (
        <Empty description={t('vaultsEmpty')}>
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            {t('vaultsCreateButton')}
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
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onEnter={handleEnter}
              onEdit={(v) => {
                setEditVault(v)
                editForm.setFieldsValue({ title: v.title })
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        title={t('vaultsCreateModalTitle')}
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false)
          createForm.resetFields()
        }}
        footer={null}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label={t('vaultsNameLabel')}
            name="title"
            rules={[{ required: true, message: t('vaultsNameRequired') }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={creating}>
              {t('vaultsCreateConfirm')}
            </Button>
            <Button onClick={() => { setCreateOpen(false); createForm.resetFields() }}>
              {t('vaultsCancelButton')}
            </Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title={t('vaultsEditModalTitle')}
        open={editVault !== null}
        onCancel={() => {
          setEditVault(null)
          editForm.resetFields()
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label={t('vaultsNameLabel')}
            name="title"
            rules={[{ required: true, message: t('vaultsNameRequired') }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={updating}>
              {t('vaultsSaveButton')}
            </Button>
            <Button onClick={() => { setEditVault(null); editForm.resetFields() }}>
              {t('vaultsCancelButton')}
            </Button>
          </Space>
        </Form>
      </Modal>
    </AppLayout>
  )
}
