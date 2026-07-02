import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const hasAuth = request.cookies.has('citehaven-auth')

  if (!hasAuth && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasAuth && pathname === '/login') {
    return NextResponse.redirect(new URL('/vaults', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
