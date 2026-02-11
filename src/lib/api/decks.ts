import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import type { Deck } from "@/types/deck";
import { MOCK_DECKS } from "@/data/mock";

async function getDecksMock(): Promise<Deck[]> {
  return MOCK_DECKS;
}

async function getDecksApi(): Promise<Deck[]> {
  return apiClient.get<Deck[]>("/decks");
}

export async function getDecks(): Promise<Deck[]> {
  if (API_CONFIG.useMock) return getDecksMock();
  return getDecksApi();
}

async function getDeckMock(id: string): Promise<Deck | null> {
  return MOCK_DECKS.find((d) => d.id === id) ?? null;
}

async function getDeckApi(id: string): Promise<Deck | null> {
  try {
    return await apiClient.get<Deck>(`/decks/${id}`);
  } catch {
    return null;
  }
}

export async function getDeck(id: string): Promise<Deck | null> {
  if (API_CONFIG.useMock) return getDeckMock(id);
  return getDeckApi(id);
}

async function createDeckMock(deck: Deck): Promise<Deck> {
  return { ...deck, id: deck.id || `deck-${Date.now()}` };
}

async function createDeckApi(deck: Omit<Deck, "id">): Promise<Deck> {
  return apiClient.post<Deck>("/decks", deck);
}

export async function createDeck(
  deck: Omit<Deck, "id"> | Deck
): Promise<Deck> {
  const payload = {
    title: deck.title,
    cards: deck.cards,
  };
  if (API_CONFIG.useMock) {
    const newDeck: Deck = {
      ...deck,
      id: deck.id ?? `deck-${Date.now()}`,
    };
    return createDeckMock(newDeck);
  }
  return createDeckApi(payload);
}
