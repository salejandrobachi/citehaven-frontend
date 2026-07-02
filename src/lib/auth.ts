const AUTH_KEY = 'citehaven-auth-data'
const COOKIE_NAME = 'citehaven-auth'
const COOKIE_MAX_AGE = 604800

interface AuthData {
  token: string
  userId: string
  email: string
}

export function saveAuth(token: string, userId: string, email: string): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ token, userId, email }))
  document.cookie = `${COOKIE_NAME}=true;path=/;max-age=${COOKIE_MAX_AGE}`
}

export function getAuth(): AuthData | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthData
  } catch {
    return null
  }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`
}

export function isAuthenticated(): boolean {
  return getAuth() !== null
}
