import {ApolloClient, HttpLink, InMemoryCache, split} from '@apollo/client/core'
import {SetContextLink} from '@apollo/client/link/context'
import {GraphQLWsLink} from '@apollo/client/link/subscriptions'
import {createClient} from 'graphql-ws'
import {getMainDefinition} from '@apollo/client/utilities'

const httpLink = new HttpLink({uri: 'http://localhost:4000/graphql'})

const authLink = new SetContextLink(({headers}, _) => {
    const token = localStorage.getItem('uno_token')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
})

const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: () => {
        const token = localStorage.getItem('uno_token')
        return {authorization: token ? `Bearer ${token}` : ""}
    },
}))

const splitLink = split(
    ({query}) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    authLink.concat(httpLink),
)

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
})