import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
})

const authLink = setContext((_, prevContext) => {
  if (typeof window === 'undefined') return prevContext
  const raw = localStorage.getItem('citehaven-auth-data')
  if (!raw) return prevContext
  try {
    const { token } = JSON.parse(raw) as { token: string }
    return {
      ...prevContext,
      headers: {
        ...(prevContext.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      },
    }
  } catch {
    return prevContext
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
