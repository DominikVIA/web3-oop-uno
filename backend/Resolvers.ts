import {RoomManager} from './services/RoomManager'
import {AuthService} from './services/AuthService'
import {PubSub} from 'graphql-subscriptions'
import type {Color} from '../src/model/deck'

const pubsub = new PubSub()
const roomManager = new RoomManager()
const authService = new AuthService()

function formatGameForUser(game: any, currentUserId: string) {
    if (!game) return null;
    const memento = game.toMemento();
    const round = game.currentRound();
    const roundMemento = round ? round.toMemento() : null;

    const playerNames = memento.players;
    const userPlayerIndex = playerNames.findIndex((name: string) => name === currentUserId);

    return {
        id: game.id || 'room-id',
        host: {id: playerNames[0], username: playerNames[0]},
        players: playerNames.map((name: string) => ({id: name, username: name})),
        targetScore: game.targetScore,
        scores: playerNames.map((_: any, idx: number) => game.score(idx)),
        winner: game.winner(),
        status: game.winner() !== undefined ? 'WON' : (round ? 'ONGOING' : 'WAITING'),
        currentRound: roundMemento ? {
            playerCount: round.playerCount,
            dealer: roundMemento.dealer,
            currentColor: roundMemento.currentColor,
            currentDirection: roundMemento.currentDirection,
            playerInTurn: round.playerInTurn(),
            topDiscardCard: round.discardPile().top(),
            players: playerNames.map((name: string, idx: number) => ({
                id: name,
                user: {id: name, username: name},
                score: game.score(idx),
                handSize: round.playerHand(idx).length,
                hasSaidUno: round.hasSaidUno(idx),
            })),

            myHand: userPlayerIndex !== -1 ? round.playerHand(userPlayerIndex) : [],
            hasEnded: round.hasEnded(),
            winner: round.winner(),
        } : null
    };
}

export const resolvers = {
    Query: {
        me: async (_: unknown, __: unknown, {currentUser}: { currentUser: any }) => {
            if (!currentUser) throw new Error('Not authenticated')
            return currentUser
        },

        getGame: (_: unknown, {gameId}: { gameId: string }, {currentUser}: { currentUser: any }) => {
            const game = roomManager.getRoom(gameId)
            return formatGameForUser(game, currentUser.username)
        },

        myGames: (_: unknown, {status}: { status?: any }, {currentUser}: { currentUser: any }) => {
            const games = roomManager.getGamesForUser(currentUser.username, status)
            return games.map(g => formatGameForUser(g, currentUser.username))
        }
    },

    Mutation: {
        register: async (_: unknown, {username, password}: { username: string; password: string }) => {
            return await authService.register(username, password)
        },

        login: async (_: unknown, {username, password}: { username: string; password: string }) => {
            return await authService.login(username, password)
        },

        createGame: (_: unknown, {targetScore}: { targetScore?: number }, {currentUser}: { currentUser: any }) => {
            if (!currentUser) throw new Error('Not authenticated')
            const gameId = crypto.randomUUID().slice(0, 8)

            const game = roomManager.createRoom(gameId, [currentUser.username], targetScore || 500)
            return formatGameForUser(game, currentUser.username)
        },

        joinGame: (_: unknown, {gameId}: { gameId: string }, {currentUser}: { currentUser: any }) => {
            if (!currentUser) throw new Error('Not authenticated')
            const game = roomManager.getRoom(gameId)

            roomManager.addPlayerToRoom(gameId, currentUser.username)

            const formattedGame = formatGameForUser(game, currentUser.username)
            pubsub.publish(`LOBBY_UPDATED_${gameId}`, {lobbyUpdated: formattedGame})
            return formattedGame
        },

        startGame: (_: unknown, {gameId}: { gameId: string }, {currentUser}: { currentUser: any }) => {
            const game = roomManager.getRoom(gameId)
            roomManager.startRoomGame(gameId)

            const formattedGame = formatGameForUser(game, currentUser.username)
            pubsub.publish(`LOBBY_UPDATED_${gameId}`, {lobbyUpdated: formattedGame})
            pubsub.publish(`GAME_UPDATED_${gameId}`, {gameUpdated: formattedGame})
            return formattedGame
        },

        playCard: (_: unknown, {gameId, cardIndex, color}: {
            gameId: string;
            cardIndex: number;
            color?: Color
        }, {currentUser}: { currentUser: any }) => {
            const room = roomManager.getRoom(gameId)
            const game = room.gameInstance
            if (!game) throw new Error('No active game')
            const round = game.currentRound()
            if (!round) throw new Error('No active round')

            const playerNames = game.toMemento().players
            const playerIndex = playerNames.findIndex((name: string) => name === currentUser.username)
            if (round.playerInTurn() !== playerIndex) throw new Error('Not your turn')

            round.play(cardIndex, color)

            const formattedGame = formatGameForUser(game, currentUser.username)
            pubsub.publish(`GAME_UPDATED_${gameId}`, {gameUpdated: formattedGame})
            return formattedGame
        },

        drawCard: (_: unknown, {gameId}: { gameId: string }, {currentUser}: { currentUser: any }) => {
            const room = roomManager.getRoom(gameId)
            const game = room.gameInstance
            if (!game) throw new Error('No active game')
            const round = game.currentRound()
            if (!round) throw new Error('No active round')

            const playerNames = game.toMemento().players
            const playerIndex = playerNames.findIndex((name: string) => name === currentUser.username)
            if (round.playerInTurn() !== playerIndex) throw new Error('Not your turn')

            round.draw()

            const formattedGame = formatGameForUser(game, currentUser.username)
            pubsub.publish(`GAME_UPDATED_${gameId}`, {gameUpdated: formattedGame})
            return formattedGame
        },

        sayUno: (_: unknown, {gameId}: { gameId: string }, {currentUser}: { currentUser: any }) => {
            const room = roomManager.getRoom(gameId)
            const game = room.gameInstance
            if (!game) throw new Error('No active game')
            const round = game.currentRound()
            if (!round) throw new Error('No active round')

            const playerNames = game.toMemento().players
            const playerIndex = playerNames.findIndex((name: string) => name === currentUser.username)

            round.sayUno(playerIndex)

            const formattedGame = formatGameForUser(game, currentUser.username)
            pubsub.publish(`GAME_UPDATED_${gameId}`, {gameUpdated: formattedGame})
            return formattedGame
        },

        catchUnoFailure: (_: unknown, {gameId, accusedIndex}: { gameId: string; accusedIndex: number }, {currentUser}: {
            currentUser: any
        }) => {
            const room = roomManager.getRoom(gameId)
            const game = room.gameInstance
            if (!game) throw new Error('No active game')
            const round = game.currentRound()
            if (!round) throw new Error('No active round')

            const playerNames = game.toMemento().players
            const playerIndex = playerNames.findIndex((name: string) => name === currentUser.username)

            round.catchUnoFailure({accuser: playerIndex, accused: accusedIndex})

            const formattedGame = formatGameForUser(game, currentUser.username)
            pubsub.publish(`GAME_UPDATED_${gameId}`, {gameUpdated: formattedGame})
            return formattedGame
        }
    },

    Subscription: {
        lobbyUpdated: {
            subscribe: (_: unknown, {gameId}: {
                gameId: string
            }) => pubsub.asyncIterableIterator([`LOBBY_UPDATED_${gameId}`])
        },
        gameUpdated: {
            subscribe: (_: unknown, {gameId}: {
                gameId: string
            }) => pubsub.asyncIterableIterator([`GAME_UPDATED_${gameId}`])
        }
    }
}