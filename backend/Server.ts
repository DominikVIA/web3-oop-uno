import express from 'express'
import http from 'node:http'
import {readFileSync} from 'fs'
import cors from 'cors'
import {ApolloServer} from '@apollo/server'
import {expressMiddleware} from '@as-integrations/express5'
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer'
import {makeExecutableSchema} from '@graphql-tools/schema'
import {WebSocketServer} from 'ws'
import {resolvers} from './Resolvers'
import {AuthService} from './services/AuthService'
// @ts-ignore
import {useServer} from "graphql-ws/use/ws";
import * as path from "node:path";

const authService = new AuthService()

const typeDefs = readFileSync(path.resolve('backend/shema.graphql')).toString('utf-8')

const schema = makeExecutableSchema({typeDefs, resolvers})

async function startServer() {
    const app = express()
    const httpServer = http.createServer(app)

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    })

    const serverCleanup = useServer({
        schema,
        context: async (ctx: any) => {
            const token = ctx.connectionParams?.authorization as string
            const currentUser = authService.verifyToken(token)
            return {currentUser, authService}
        },
    }, wsServer)

    const server = new ApolloServer({
        schema,
        csrfPrevention: false,
        plugins: [
            ApolloServerPluginDrainHttpServer({httpServer}),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose()
                        },
                    }
                },
            },
        ],
    })

    await server.start()

    app.use(
        '/graphql',
        cors<cors.CorsRequest>({
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({req}: { req: any }) => {
                const token = req.headers.authorization
                const currentUser = authService.verifyToken(token)
                return {currentUser, authService}
            },
        }) as any,
    )

    const PORT = 4000
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
        console.log(`🔌 Subscriptions ready at ws://localhost:${PORT}/graphql`)
    })
}

startServer().catch((err) => {
    console.error('Failed to start server:', err)
})