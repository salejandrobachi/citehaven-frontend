import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['es', 'en']

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value ?? 'es'
  const locale = SUPPORTED_LOCALES.includes(raw) ? raw : 'es'
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
