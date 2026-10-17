import {defineStore} from 'pinia'
import type {Round} from '../model/round'
import {createRound} from '../model/round'
import type {Card, Color} from '../model/deck'

export const useGameStore = defineStore('game', {
    state: () => ({
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
                index,
                cardCount: state.round!.playerHand(index).length
            })).filter((_, index) => index !== 0)
        },

        winnerName(state): string {
            const _ = state.updateTrigger
            if (!this.round) return ''
            const winner = this.round.winner()
            return winner === undefined ? '' : state.round!.player(winner)
        },

        hasEnded(state): boolean {
            const _ = state.updateTrigger
            return !!state.round?.hasEnded()
        },

        hasUserSaidUno(state): boolean {
            const _ = state.updateTrigger
            return state.round ? state.round.hasSaidUno(0) : false
        },
    },

    actions: {
        startGame(botCount: number) {
            const players = ['You', ...Array.from({length: botCount}, (_, i) => `Bot ${i + 1}`)]
            this.round = createRound(players, players.length - 1)
            this.updateTrigger++
        },

        playHumanCard(index: number, color?: Color) {
            if (!this.round) return
            try {
                this.round.play(index, color)
                this.updateTrigger++
            } catch (error) {
                console.error(error)
                this.updateTrigger++
            }
        },

        sayUno() {
            if (!this.round) return
            try {
                this.round.sayUno(0)
                this.updateTrigger++
            } catch (error) {
                console.error(error)
            }
        },

        drawCard() {
            if (!this.round || this.round.playerInTurn() !== 0 || this.round.canPlayAny()) return

            this.round.draw()
            this.updateTrigger++
        },

    }
})