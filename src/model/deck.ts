export type ActionType = "SKIP" | "REVERSE" | "DRAW"
export type WildType = "WILD" | "WILD DRAW"
export type Type = "NUMBERED" | ActionType | WildType
export type Color = "RED" | "YELLOW" | "GREEN" | "BLUE"

export const colors: Color[] = ["RED", "YELLOW", "GREEN", "BLUE"]

type ColoredCard = {
    type: ActionType
    color: Color
    number?: never
}

type WildCard = {
    type: WildType
    color?: Color
    number?: never
}

type NumberedCard = {
    type: "NUMBERED"
    color: Color
    number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
}

export type Card = ColoredCard | WildCard | NumberedCard

export type Deck = {
    cards: Card[]
    shuffle(shuffleFn: (_: Card[]) => void): void
    deal(): Card | undefined
    filter(pred: (_: Card | undefined) => boolean): Deck
    size: number
}

export function createDeck(initialCards: Card[]): Deck {
  const cards = [...initialCards];

  return {
    cards,
    deal() {
      return cards.pop();
    },
    shuffle(shuffleFn) {
      shuffleFn(cards);
    },
    filter(pred) {
      return createDeck(cards.filter(pred));
    },
    get size() {
      return cards.length;
    },
  };
}