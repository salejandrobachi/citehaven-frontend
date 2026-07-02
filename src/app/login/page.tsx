'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Alert, Button, ConfigProvider, Form, Input, Tooltip, Typography } from 'antd'
import type { AlertProps } from 'antd'
import { useTranslations } from 'next-intl'
import { saveAuth } from '@/lib/auth'
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  type LoginData,
  type LoginVariables,
  type RegisterData,
  type RegisterVariables,
} from '@/shared/graphql/auth'
import { darkThemeConfig, lightThemeConfig } from '@/shared/theme/tokens'
import { CiteHavenLogo } from '@/shared/components/CiteHavenLogo'

const { Title } = Typography

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('citehaven-theme') === 'dark'
}

export default function LoginPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: AlertProps['type']; message: string } | null>(null)
  const [isDark, setIsDark] = useState(getInitialTheme)

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem('citehaven-theme', next ? 'dark' : 'light')
      return next
    })
  }

  const [login, { loading: loginLoading }] = useMutation<LoginData, LoginVariables>(LOGIN_MUTATION)
  const [register, { loading: registerLoading }] = useMutation<RegisterData, RegisterVariables>(
    REGISTER_MUTATION,
  )

  const isLoading = loginLoading || registerLoading

  interface FormValues {
    email: string
    password: string
    name?: string
    organizationCode?: string
  }

  const handleSubmit = async (values: FormValues) => {
    setError(null)
    setFeedback(null)
    try {
      if (isRegister) {
        const res = await register({
          variables: {
            email: values.email,
            password: values.password,
            name: values.name ?? undefined,
            organizationCode: values.organizationCode ?? undefined,
          },
        })
        const payload = res.data?.register
        if (!payload) throw new Error(t('loginErrorUnexpected'))
        saveAuth(payload.token, payload.userId, payload.email)
        setFeedback({ type: 'success', message: t('loginRegisterSuccess') })
        setTimeout(() => router.push('/vaults'), 1500)
      } else {
        const res = await login({
          variables: { email: values.email, password: values.password },
        })
        const payload = res.data?.login
        if (!payload) throw new Error(t('loginErrorUnexpected'))
        saveAuth(payload.token, payload.userId, payload.email)
        router.push('/vaults')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginErrorUnexpected'))
    }
  }

  const dotColor = isDark ? '%232DBF9E' : '%230F6B5C'
  const bgBase = isDark ? '#0D1412' : '#FAF8F4'
  const vignetteColor = isDark ? 'rgba(10,19,16,0.75)' : 'rgba(235,230,220,0.65)'

  return (
    <ConfigProvider theme={isDark ? darkThemeConfig : lightThemeConfig}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: bgBase,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='1.4' fill='${dotColor}' opacity='0.18'/%3E%3C/svg%3E")`,
        }}
      >
        {/* vignette overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, transparent 35%, ${vignetteColor} 100%)`,
            pointerEvents: 'none',
          }}
        />

        <Tooltip title={isDark ? t('themeSwitchToLight') : t('themeSwitchToDark')}>
          <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            aria-label={isDark ? t('themeSwitchToLight') : t('themeSwitchToDark')}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          />
        </Tooltip>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 400,
            padding: '40px 32px',
            background: isDark ? 'rgba(22,31,28,0.97)' : 'rgba(255,255,255,0.97)',
            borderRadius: 14,
            boxShadow: isDark
              ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,191,158,0.10)'
              : '0 8px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(15,107,92,0.07)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <CiteHavenLogo size={48} isDark={isDark} />
            <Title level={3} style={{ marginTop: 12, marginBottom: 4 }}>
              {t('branding')}
            </Title>
            <Typography.Text type="secondary">
              {isRegister ? t('loginRegisterSubtitle') : t('loginSubtitle')}
            </Typography.Text>
          </div>

          <Form layout="vertical" onFinish={handleSubmit} size="large">
            <Form.Item
              label={t('loginEmail')}
              name="email"
              rules={[{ required: true, type: 'email', message: t('loginEmailRequired') }]}
            >
              <Input autoComplete="email" />
            </Form.Item>

            <Form.Item
              label={t('loginPassword')}
              name="password"
              rules={[{ required: true, message: t('loginPasswordRequired') }]}
            >
              <Input.Password autoComplete={isRegister ? 'new-password' : 'current-password'} />
            </Form.Item>

            {isRegister && (
              <>
                <Form.Item label={t('loginName')} name="name">
                  <Input autoComplete="name" />
                </Form.Item>

                <Form.Item label={t('loginOrgCode')} name="organizationCode">
                  <Input />
                </Form.Item>
              </>
            )}

            {feedback && (
              <Form.Item>
                <Alert type={feedback.type} message={feedback.message} showIcon />
              </Form.Item>
            )}

            {error && (
              <Form.Item>
                <Alert type="error" message={error} showIcon />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 8 }}>
              <Button type="primary" htmlType="submit" block loading={isLoading} disabled={feedback?.type === 'success'}>
                {isRegister ? t('loginRegisterButton') : t('loginButton')}
              </Button>
            </Form.Item>

            <Button
              type="link"
              block
              onClick={() => {
                setIsRegister((v) => !v)
                setError(null)
              }}
            >
              {isRegister ? t('loginSwitchToLogin') : t('loginSwitchToRegister')}
            </Button>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  )
}
