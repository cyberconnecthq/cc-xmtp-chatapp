import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

export const client = new ApolloClient({
  uri: 'https://api.cyberconnect.dev',
  cache: new InMemoryCache()
})