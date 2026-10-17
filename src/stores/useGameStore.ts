import {defineStore} from 'pinia'
import type {Round} from '../model/round'
import {createRound} from '../model/round'
import type {Card, Color} from '../model/deck'

export const useGameStore = defineStore('game', {
    state: () => ({
        screen: 'setup' as 'setup' | 'game' | 'result',
        botCount: 1,
        round: null as Round | null,
        updateTrigger: 0,
    }),

    getters: {
        currentPlayer(state) {
            const _ = state.updateTrigger
            return state.round ? state.round.playerInTurn() : undefined
        },

        currentPlayerName(): string {
            const p = this.currentPlayer
            if (p === undefined) return 'Round ended'
            return this.round!.player(p)
        },

        currentColor(state): Color | undefined {
            const _ = state.updateTrigger
            return state.round?.toMemento().currentColor
        },

        topCard(state): Card | undefined {
            const _ = state.updateTrigger
            return state.round?.discardPile().top()
        },

        myHand(state): Card[] {
            const _ = state.updateTrigger
            return state.round ? state.round.playerHand(0).map(card => ({...card})) : []
        },

        bots(state) {
            const _ = state.updateTrigger
            if (!state.round) return []
            const memento = state.round.toMemento()
            return memento.players.map((name, index) => ({
                name,
                cardCount: state.round!.playerHand(index).length
            })).filter((_, index) => index !== 0)
        },

        winnerName(state): string {
            const _ = state.updateTrigger
            if (!state.round) return ''
            const winner = this.round!.winner()
            return winner === undefined ? '' : state.round.player(winner)
        }
    },

    actions: {
        startGame() {
            const players = ['You']
            for (let i = 1; i <= this.botCount; i++) {
                players.push(`Bot ${i}`)
            }

            this.round = createRound(players, players.length - 1)
            this.screen = 'game'
            this.updateTrigger++
        },

        checkGameStatus() {
            if (this.round && this.round.hasEnded()) {
                this.screen = 'result'
            }
        },

        playHumanCard(index: number, color?: Color) {
            if (!this.round) return
            try {
                this.round.play(index, color)
                this.updateTrigger++
                this.checkGameStatus()
            } catch (error) {
                console.error(error)
                this.updateTrigger++
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
            this.updateTrigger++
            this.checkGameStatus()
        },

        formatCard(card: Card | undefined) {
            if (!card) return 'Sin carta'
            if (card.type === 'NUMBERED') return `${card.color} ${card.number}`
            if (card.type === 'WILD' || card.type === 'WILD DRAW') return card.type
            return `${card.color} ${card.type}`
        }
    }
})