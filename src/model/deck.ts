import { Shuffler } from '../utils/random_utils'

export const colors = ['BLUE', 'GREEN', 'RED', 'YELLOW'] as const
export type Color = typeof colors[number]
export type Type = 'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW' | 'WILD' | 'WILD DRAW'
export type TypedCard<T extends Type> = T extends 'NUMBERED' ? { type: T, color: Color, number: number } : T extends 'WILD' | 'WILD DRAW' ? { type: T } : { type: T, color: Color }
export type NumberedCard = TypedCard<'NUMBERED'>
export type ColouredCard = TypedCard<'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW'>
export type WildCard = TypedCard<'WILD' | 'WILD DRAW'>
export type Card = NumberedCard | ColouredCard | WildCard
export type CardMemento = Record<string, string | number>

export interface Deck { readonly size: number; deal(): Card | undefined; peek(): Card | undefined; top(): Card | undefined; filter(predicate: (card: Card) => boolean): Deck; shuffle(shuffler: Shuffler<Card>): void; add(card: Card): void; toMemento(): CardMemento[] }
function validColor(value: unknown): value is Color { return (colors as readonly unknown[]).includes(value) }
function cardFromMemento(m: CardMemento): Card {
  if (m.type === 'NUMBERED') { if (!validColor(m.color) || typeof m.number !== 'number' || !Number.isInteger(m.number) || m.number < 0 || m.number > 9) throw new Error('Invalid numbered card'); return {type:'NUMBERED', color:m.color, number:m.number} }
  if (m.type === 'SKIP' || m.type === 'REVERSE' || m.type === 'DRAW') { if (!validColor(m.color)) throw new Error('Invalid coloured card'); return {type:m.type, color:m.color} as Card }
  if (m.type === 'WILD' || m.type === 'WILD DRAW') return {type:m.type}
  throw new Error('Invalid card type')
}
class CardDeck implements Deck { constructor(private cards: Card[]) {} get size(){return this.cards.length} deal(){return this.cards.shift()} peek(){return this.cards[0]} top(){return this.cards[0]} add(c:Card){this.cards.unshift(c)} filter(p:(c:Card)=>boolean){return new CardDeck(this.cards.filter(p))} shuffle(s:Shuffler<Card>){s(this.cards)} toMemento(){return this.cards.map(c=>({...c}))} }
export function createDeck(cards: Card[] = []): Deck { return new CardDeck(cards) }
export function createDeckFromMemento(cards: CardMemento[]): Deck { return createDeck(cards.map(cardFromMemento)) }
export function hasColor(card: Card, color: Color) { return 'color' in card && card.color === color }
export function hasNumber(card: Card, number: number) { return card.type === 'NUMBERED' && card.number === number }
export function createInitialDeck(): Deck { const cards:Card[]=[]; for(const color of colors){cards.push({type:'NUMBERED',color,number:0}); for(let n=1;n<=9;n++) cards.push({type:'NUMBERED',color,number:n},{type:'NUMBERED',color,number:n}); for(const type of ['SKIP','REVERSE','DRAW'] as const) cards.push({type,color},{type,color})} for(let i=0;i<4;i++) cards.push({type:'WILD'},{type:'WILD DRAW'}); return createDeck(cards) }
export function cardPoints(card: Card) { return card.type==='NUMBERED'?card.number:(card.type==='WILD'||card.type==='WILD DRAW'?50:20) }
