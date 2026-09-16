export const ACTION_TYPES = ["SKIP", "REVERSE", "DRAW"] as const;
export const WILD_TYPES = ["WILD", "WILD DRAW"] as const;
export const NUMBERED_TYPE = ["NUMBERED"] as const;
export const COLORS = ["RED", "YELLOW", "GREEN", "BLUE"] as const;

export type ActionType = (typeof ACTION_TYPES)[number]
export type WildType = (typeof WILD_TYPES)[number]
export type NumberedType = (typeof NUMBERED_TYPE)[number]
export type Type = NumberedType | ActionType | WildType
export type Color = (typeof COLORS)[number]

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
    toMemento(): Record<string, string | number>[]
    size: number
}

export function hasColor(card: Card, color: Color): boolean {
  if (card === undefined || card.type === "WILD" || card.type === "WILD DRAW") {
    return false
  }
  return card.color === color
}

export function hasNumber(card: Card, number: number): boolean {
    if (card === undefined || card.type !== "NUMBERED") {
        return false
    }
    return card.number === number
}

export function createDeck(initialCards: Card[]): Deck {
  const cards = [...initialCards];

  return {
    cards,
    deal() {
      return cards.shift();
    },
    shuffle(shuffleFn) {
      shuffleFn(cards);
    },
    filter(pred) {
      return createDeck(cards.filter(pred));
    },
    toMemento() {
      return cards.map(card => {
        const memento: Record<string, string | number> = { type: card.type };
        if (card.color) {
          memento.color = card.color;
        }
        if (card.number !== undefined) {
          memento.number = card.number;
        }
        return memento;
      });
    },
    get size() {
      return cards.length;
    },
  };
}