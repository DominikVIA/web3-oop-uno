import {defineStore} from 'pinia'
import type {Round} from '../model/round'
import {createRound} from '../model/round'
import type {Card, Color} from '../model/deck'

export const useGameStore = defineStore('game', {
    state: () => ({
        screen: 'setup' as 'setup' | 'game' | 'result',
        botCount: 1,
        view: null as any,
        pendingWildIndex: null as number | null,
        colors: ['BLUE', 'RED', 'GREEN', 'YELLOW'] as Color[],

        // Non-reactive or markRaw references to prevent proxy overhead on heavy classes/workers
        round: null as Round | null,
        worker: null as Worker | null,
    }),

    actions: {
        initWorker() {
            if (!this.worker) {
                this.worker = new Worker('/bot.worker.js')
            }
        },

        terminateWorker() {
            if (this.worker) {
                this.worker.terminate()
                this.worker = null
            }
        },

        startGame() {
            const players = ['You']
            for (let i = 1; i <= this.botCount; i++) {
                players.push(`Bot ${i}`)
            }

            this.round = createRound(players, players.length - 1)
            this.pendingWildIndex = null
            this.screen = 'game'
            this.refreshView()
            this.runBotTurn()
        },

        refreshView() {
            if (!this.round) return

            const memento = this.round.toMemento()
            const currentPlayer = this.round.playerInTurn()
            const winner = this.round.winner()

            this.view = {
                currentPlayer,
                currentPlayerName: currentPlayer === undefined ? 'Round ended' : this.round.player(currentPlayer),
                currentColor: memento.currentColor,
                topCard: this.round.discardPile().top(),
                myHand: this.round.playerHand(0).map(card => ({...card})),
                bots: memento.players.map((name, index) => ({
                    name,
                    cardCount: this.round!.playerHand(index).length
                })).filter((_, index) => index !== 0),
                winnerName: winner === undefined ? '' : this.round.player(winner)
            }

            if (this.round.hasEnded()) {
                this.screen = 'result'
            }
        },

        selectCard(index: number) {
            if (!this.round || this.round.playerInTurn() !== 0 || !this.round.canPlay(index)) return

            const hand = this.round.playerHand(0)
            const card = hand[index]
            if (card.type === 'WILD' || card.type === 'WILD DRAW') {
                this.pendingWildIndex = index
                return
            }

            this.playHumanCard(index)
        },

        playWild(color: Color) {
            if (this.pendingWildIndex === null) return
            const index = this.pendingWildIndex
            this.pendingWildIndex = null
            this.playHumanCard(index, color)
        },

        playHumanCard(index: number, color?: Color) {
            if (!this.round) return
            try {
                this.round.play(index, color)
                this.refreshView()
                this.runBotTurn()
            } catch (error) {
                console.error(error)
                this.refreshView()
            }
        },

        sayUno() {
            if (!this.round) return
            try {
                this.round.sayUno(0)
            } catch (error) {
                console.error(error)
            }
        },

        drawCard() {
            if (!this.round || this.round.playerInTurn() !== 0 || this.round.canPlayAny()) return

            this.round.draw()
            this.refreshView()

            if (this.round.playerInTurn() !== 0) {
                this.runBotTurn()
            }
        },

        runBotTurn() {
            if (this.screen !== 'game' || !this.round) return

            const playerIndex = this.round.playerInTurn()
            if (playerIndex === undefined || playerIndex === 0) {
                this.refreshView()
                return
            }

            const hand = this.round.playerHand(playerIndex)
            const legalIndices = hand.map((_, index) => index).filter(index => this.round!.canPlay(index))

            if (legalIndices.length === 0) {
                this.round.draw()
                this.refreshView()
                window.setTimeout(() => this.runBotTurn(), 300)
                return
            }

            if (this.worker) {
                this.worker.postMessage({
                    hand: hand.map(card => ({...card})),
                    legalIndices
                })
            }
        },

        handleBotMessage(data: any) {
            if (this.screen !== 'game' || !this.round) return

            const playerIndex = this.round.playerInTurn()
            if (playerIndex === undefined || playerIndex === 0) return

            if (data.action === 'draw') {
                this.round.draw()
                this.refreshView()
                window.setTimeout(() => this.runBotTurn(), 300)
                return
            }

            try {
                const hand = this.round.playerHand(playerIndex)
                if (hand.length === 2) {
                    this.round.sayUno(playerIndex)
                }

                this.round.play(data.index, data.color)
                this.refreshView()
                window.setTimeout(() => this.runBotTurn(), 300)
            } catch (error) {
                console.error(error)
                this.refreshView()
            }
        },

        formatCard(card: Card | undefined) {
            if (!card) return 'Sin carta'
            if (card.type === 'NUMBERED') return `${card.color} ${card.number}`
            if (card.type === 'WILD' || card.type === 'WILD DRAW') return card.type
            return `${card.color} ${card.type}`
        }
    }
})