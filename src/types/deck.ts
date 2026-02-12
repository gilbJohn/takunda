export interface Card {
  id: string;
  front: string;
  back: string;
}

export interface Deck {
  id: string;
  title: string;
  cards: Card[];
  createdAt?: string;
  /** Creator's display name (for explored decks) */
  creatorName?: string;
}
