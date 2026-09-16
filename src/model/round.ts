import { Deck, Card } from "./deck"

type DiscardPile = {
cards: Card[]
    top(): Card | undefined
    size: number
    push(): (card: Card) => void
}

export function createDiscardPile(): DiscardPile {
    const cards: Card[] = []

    return {
        cards,
        top() {
            return cards.at(-1);
        },
        get size() {
            return cards.length;
        },
        push() {
            return (card: Card) => {
                cards.push(card);
            }
        }
    }
}

export type Round = {
    players: string[]
    player(index: number): string
    playerHand(index: number): Card[]
    playerInTurn(): number
    playerCount: number
    dealer: number
    playerHand(index: number): Readonly<Card[]>
    drawPile(): Deck
    discardPile(): DiscardPile
    toMemento(): Record<string, any>
}
export type Game = any