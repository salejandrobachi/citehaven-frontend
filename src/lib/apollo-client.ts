import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const httpLink = new HttpLink({
  uri: 'https://citehaven-backend.vercel.app/'
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})