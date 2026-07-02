'use client'

import { useRef, useState } from 'react'
import {
  AppstoreOutlined,
  CameraOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, message, theme, Tooltip } from 'antd'
import type { GlobalToken } from 'antd'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { clearAuth, getAuth } from '@/lib/auth'
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

const VAULT_TITLE_KEY = 'citehaven-vault-title'
const AVATAR_KEY = 'citehaven-avatar'

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
  const pathname = usePathname()
  const [vaultTitle] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(VAULT_TITLE_KEY)
  })

  const authData = getAuth()
  const initial = (authData?.email?.[0] ?? '?').toUpperCase()
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AVATAR_KEY)
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) {
      void message.error(t('avatarErrorFileType'))
      return
    }
    if (file.size > 1024 * 1024) {
      void message.error(t('avatarErrorFileSize'))
      return
    }

    const auth = getAuth()
    if (!auth) return

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${apiUrl}user/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        void message.error(text || t('avatarErrorUpload'))
        return
      }

      const { avatarUrl } = (await res.json()) as { avatarUrl: string }
      localStorage.setItem(AVATAR_KEY, avatarUrl)
      setAvatarSrc(avatarUrl)
    } catch {
      void message.error(t('avatarErrorUpload'))
    }
  }

  const handleLocaleChange = (newLocale: string) => {
    setLocaleCookie(newLocale)
    router.refresh()
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
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
                  minWidth: 180,
                }}
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '6px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: token.colorText,
                    fontSize: token.fontSize,
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.background = token.colorBgTextHover
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }}
                >
                  <CameraOutlined />
                  <span>{t('menuChangePhoto')}</span>
                </div>
                <LanguageItem
                  locale={locale}
                  token={token}
                  langLabel={t('menuLanguage')}
                  langEs={t('langEs')}
                  langEn={t('langEn')}
                  onSelect={handleLocaleChange}
                />
                <div
                  onClick={handleLogout}
                  style={{
                    padding: '6px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: token.colorError,
                    fontSize: token.fontSize,
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.background = token.colorBgTextHover
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }}
                >
                  <LogoutOutlined />
                  <span>{t('menuLogout')}</span>
                </div>
              </div>
            )}
          >
            <Avatar
              size={40}
              src={avatarSrc ?? undefined}
              style={{
                cursor: 'pointer',
                background: avatarSrc ? undefined : token.colorPrimary,
                fontSize: 16,
                fontWeight: 600,
                userSelect: 'none',
              }}
            >
              {!avatarSrc && initial}
            </Avatar>
          </Dropdown>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarFile}
          />
        </div>
        <Menu
          theme="dark"
          selectedKeys={[pathname.includes('/vaults') ? 'vaults' : '']}
          mode="inline"
          onClick={({ key }) => {
            if (key === 'vaults') router.push('/vaults')
          }}
          items={[
            {
              key: 'vaults',
              icon: <AppstoreOutlined />,
              label: t('navVaults'),
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {vaultTitle && (
              <span style={{ fontSize: 13, color: token.colorTextSecondary }}>
                {vaultTitle}
              </span>
            )}
            <Tooltip title={isDark ? t('themeSwitchToLight') : t('themeSwitchToDark')}>
              <Button
                type="text"
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={onToggleTheme}
                aria-label={isDark ? t('themeSwitchToLight') : t('themeSwitchToDark')}
              />
            </Tooltip>
          </div>
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
