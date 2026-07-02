import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const cookieStore = await cookies()
  const hasAuth = cookieStore.has('citehaven-auth')
  redirect(hasAuth ? '/vaults' : '/login')
}
