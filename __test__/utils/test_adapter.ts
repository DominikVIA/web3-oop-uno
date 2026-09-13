import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from '../../src/utils/random_utils'
import * as deck from '../../src/model/deck'

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Fix (or import) these types:
type Card = any
type Round = any
type Game = any

//Fill out the empty functions
export function createInitialDeck(): deck.Deck {
  const cards: Card[] = []

  for (const color of deck.colors) {
    // 1. Single 0 card
    cards.push({ type: "NUMBERED", color, number: 0 });

    // 2. Two of each digit (1-9)
    for (const number of digits) {
      cards.push({ type: "NUMBERED", color, number });
      cards.push({ type: "NUMBERED", color, number });
    }

    // 3. Two of each action card
    for (const type of ["SKIP", "REVERSE", "DRAW"] as const) {
      cards.push({ type, color });
      cards.push({ type, color });
    }
  }

  // 4. Four of each wild card
  for (let i = 0; i < 4; i++) {
    cards.push({ type: "WILD" });
    cards.push({ type: "WILD DRAW" });
  }

  return deck.createDeck(cards);
}

export function createDeckFromMemento(cards: Record<string, string | number>[]): any {
}

export type HandConfig = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<Card>
  cardsPerPlayer?: number
}

export function createRound({
    players, 
    dealer, 
    shuffler = standardShuffler,
    cardsPerPlayer = 7
  }: HandConfig): Round {
}

export function createRoundFromMemento(memento: any, shuffler: Shuffler<Card> = standardShuffler): Round {
}

export type GameConfig = {
  players: string[]
  targetScore: number
  randomizer: Randomizer
  shuffler: Shuffler<Card>
  cardsPerPlayer: number
}

export function createGame(props: Partial<GameConfig>): Game {
}

export function createGameFromMemento(memento: any, randomizer: Randomizer = standardRandomizer, shuffler: Shuffler<Card> = standardShuffler): Game {
}
