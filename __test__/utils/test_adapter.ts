import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from '../../src/utils/random_utils'
import * as deck from '../../src/model/deck'

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

// Fix (or import) these types:
type Round = any
type Game = any

//Fill out the empty functions
export function createInitialDeck(): deck.Deck {
  const cards: deck.Card[] = []

  // per color
  for (const color of deck.COLORS) {

    // numbered cards, single 0 and two of 1-9
    cards.push({ type: "NUMBERED", color, number: 0 });
    DIGITS.forEach(number => {
      cards.push({ type: "NUMBERED", color, number });
      cards.push({ type: "NUMBERED", color, number });
    });

    // two of each action card
    for (const type of ["SKIP", "REVERSE", "DRAW"] as const) {
      cards.push({ type, color });
      cards.push({ type, color });
    }
  }

  // four of each wild card
  for (let i = 0; i < 4; i++) {
    cards.push({ type: "WILD" });
    cards.push({ type: "WILD DRAW" });
  }

  return deck.createDeck(cards);
}

function isString(value: string | number): value is string {
  return typeof value === "string";
}

function isNumber(value: string | number): value is number {
  return typeof value === "number";
}

function isActionType(value: string): value is deck.ActionType {
  return (deck.ACTION_TYPES as readonly string[]).includes(value);
}

function isWildType(value: string): value is deck.WildType {
  return (deck.WILD_TYPES as readonly string[]).includes(value);
}

function isNumberedType(value: string): value is deck.NumberedType {
  return (deck.NUMBERED_TYPE as readonly string[]).includes(value);
}

function isCardColor(val: string | number): val is deck.Color {
  return isString(val) && (deck.COLORS as readonly string[]).includes(val);
}

function isCardNumber(val: string | number): val is (typeof DIGITS)[number] {
  return isNumber(val) && Number.isInteger(val) && val >= 0 && val <= 9;
}

export function parseCard(raw: Record<string, string | number>): deck.Card {
  const { type, color, number } = raw;

  if (!isString(type)) {
    throw new Error("Missing or invalid 'type' property");
  }

  if (isWildType(type)) {
    return {
      type,
      ...(isCardColor(color) && { color }),
    };
  } else if (isActionType(type)) {
    if (!isCardColor(color)) {
      throw new Error(`Invalid or missing color '${color}' for '${type}' card: '${raw}'`);
    }
    return { type, color };
  } else if (isNumberedType(type)) {
    if (!isCardColor(color) || !isCardNumber(number)) {
      throw new Error(`Invalid color '${color}' or number '${number}' for Numbered card`);
    }
    return { type: "NUMBERED", color, number };
  }

  throw new Error(`Invalid card type: ${type}`);
}

export function createDeckFromMemento(records: Record<string, string | number>[]): deck.Deck {
  const cards = records.map(parseCard);
  return deck.createDeck(cards)
}

export type HandConfig = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<deck.Card>
  cardsPerPlayer?: number
}

export function createRound({
    players, 
    dealer, 
    shuffler = standardShuffler,
    cardsPerPlayer = 7
  }: HandConfig): Round {
}

export function createRoundFromMemento(memento: any, shuffler: Shuffler<deck.Card> = standardShuffler): Round {
}

export type GameConfig = {
  players: string[]
  targetScore: number
  randomizer: Randomizer
  shuffler: Shuffler<deck.Card>
  cardsPerPlayer: number
}

export function createGame(props: Partial<GameConfig>): Game {
}

export function createGameFromMemento(memento: any, randomizer: Randomizer = standardRandomizer, shuffler: Shuffler<deck.Card> = standardShuffler): Game {
}
