import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Deck } from "@/types/deck";
import { MOCK_DECKS } from "@/data/mock";
import { API_CONFIG } from "@/lib/config/api";
import {
  createDeck as apiCreateDeck,
  getDecks as apiGetDecks,
} from "@/lib/api";

const STORAGE_KEY = "takunda-study";

interface StudyState {
  decks: Deck[];
  addDeck: (deck: Omit<Deck, "id"> | Deck) => Promise<void>;
  getDeck: (id: string) => Deck | undefined;
  /** Call on app load when using real API to fetch decks from backend */
  loadDecks: () => Promise<void>;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      decks: MOCK_DECKS,

      addDeck: async (deckInput) => {
        const deck = await apiCreateDeck(deckInput);
        set((state) => ({ decks: [...state.decks, deck] }));
      },

      getDeck: (id: string) => {
        return get().decks.find((d) => d.id === id);
      },

      loadDecks: async () => {
        if (!API_CONFIG.useMock) {
          try {
            const decks = await apiGetDecks();
            set({ decks });
          } catch {
            // Backend unavailable; keep existing decks or empty
          }
        }
      },
    }),
    { name: STORAGE_KEY }
  )
);
