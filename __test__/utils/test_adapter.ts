import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from '../../src/utils/random_utils'
import * as deck from '../../src/model/deck'
import * as round from '../../src/model/round'
import * as uno from '../../src/model/uno'

// Fix (or import) these types:
type Card = deck.Card
type Deck = deck.Deck
type Round = round.Round
type Game = uno.Game

//Fill out the empty functions
export function createInitialDeck(): Deck {
  return deck.createInitialDeck()
}

export function createDeckFromMemento(cards: Record<string, string | number>[]): Deck {
  return deck.createDeckFromMemento(cards)
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
  return round.createRound(players, dealer < players.length ? dealer : dealer % players.length, shuffler, cardsPerPlayer)
}

export function createRoundFromMemento(memento: any, shuffler: Shuffler<Card> = standardShuffler): Round {
  return round.createRoundFromMemento(memento, shuffler)
}

export type GameConfig = {
  players: string[]
  targetScore: number
  randomizer: Randomizer
  shuffler: Shuffler<Card>
  cardsPerPlayer: number
}

export function createGame(props: Partial<GameConfig>): Game {
  return uno.createGame(props.players ?? ['A','B'], props.targetScore ?? 500, props.randomizer ?? standardRandomizer, props.shuffler ?? standardShuffler, props.cardsPerPlayer ?? 7)
}

export function createGameFromMemento(memento: any, randomizer: Randomizer = standardRandomizer, shuffler: Shuffler<Card> = standardShuffler): Game {
  return uno.createGameFromMemento(memento, randomizer, shuffler)
}
