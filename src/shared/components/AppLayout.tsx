'use client'

import { useState } from 'react'
import { FileTextOutlined, MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, theme, Tooltip } from 'antd'
import type { GlobalToken } from 'antd'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { darkThemeConfig, lightThemeConfig } from '@/shared/theme/tokens'
import { CiteHavenLogo } from './CiteHavenLogo'

const { Header, Sider, Content } = Layout

function setLocaleCookie(locale: string): void {
  document.cookie = `locale=${locale};path=/;max-age=31536000`
}

interface LanguageItemProps {
  locale: string
  token: GlobalToken
  langLabel: string
  langEs: string
  langEn: string
  onSelect: (locale: string) => void
}

function LanguageItem({ locale, token, langLabel, langEs, langEn, onSelect }: LanguageItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        style={{
          padding: '6px 16px',
          cursor: 'default',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          color: token.colorText,
          fontSize: token.fontSize,
          background: open ? token.colorBgTextHover : 'transparent',
        }}
      >
        <span>{langLabel}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>›</span>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            left: '100%',
            top: 0,
            background: token.colorBgElevated,
            borderRadius: token.borderRadius,
            boxShadow: token.boxShadowSecondary,
            padding: '4px 0',
            minWidth: 130,
          }}
        >
          {[
            { key: 'es', label: langEs },
            { key: 'en', label: langEn },
          ].map(({ key, label }) => (
            <div
              key={key}
              onClick={() => onSelect(key)}
              style={{
                padding: '6px 16px',
                cursor: 'pointer',
                color: key === locale ? token.colorPrimary : token.colorText,
                fontWeight: key === locale ? 600 : 400,
                fontSize: token.fontSize,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.background = token.colorBgTextHover
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

interface LayoutInnerProps {
  children: React.ReactNode
  isDark: boolean
  onToggleTheme: () => void
}

function LayoutInner({ children, isDark, onToggleTheme }: LayoutInnerProps) {
  const { token } = theme.useToken()
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const handleLocaleChange = (newLocale: string) => {
    setLocaleCookie(newLocale)
    router.refresh()
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" collapsed collapsedWidth={60} style={{ overflow: 'visible' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px 0 12px',
          }}
        >
          <Dropdown
            placement="rightTop"
            trigger={['hover']}
            getPopupContainer={() => document.body}
            popupRender={() => (
              <div
                style={{
                  background: token.colorBgElevated,
                  borderRadius: token.borderRadius,
                  boxShadow: token.boxShadowSecondary,
                  padding: '4px 0',
                  minWidth: 150,
                }}
              >
                <LanguageItem
                  locale={locale}
                  token={token}
                  langLabel={t('menuLanguage')}
                  langEs={t('langEs')}
                  langEn={t('langEn')}
                  onSelect={handleLocaleChange}
                />
              </div>
            )}
          >
            <Avatar size={40} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['documents']}
          mode="inline"
          items={[
            {
              key: 'documents',
              icon: <FileTextOutlined />,
              label: t('navDocuments'),
              title: '',
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `0 1px 4px ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CiteHavenLogo size={37} isDark={isDark} />
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: token.colorPrimary }}>
              {t('branding')}
            </span>
          </div>

          <Tooltip title={isDark ? t('themeSwitchToLight') : t('themeSwitchToDark')}>
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={onToggleTheme}
              aria-label={isDark ? t('themeSwitchToLight') : t('themeSwitchToDark')}
            />
          </Tooltip>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isDark, setIsDark] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('citehaven-theme') === 'dark'
  )

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem('citehaven-theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <ConfigProvider theme={isDark ? darkThemeConfig : lightThemeConfig}>
      <LayoutInner isDark={isDark} onToggleTheme={toggleTheme}>
        {children}
      </LayoutInner>
    </ConfigProvider>
  )
}
