import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Deck } from "@/types/deck";
import { MOCK_DECKS } from "@/data/mock";

const STORAGE_KEY = "takunda-study";

interface StudyState {
  decks: Deck[];
  addDeck: (deck: Deck) => void;
  getDeck: (id: string) => Deck | undefined;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      decks: MOCK_DECKS,

      addDeck: (deck: Deck) => {
        set((state) => ({ decks: [...state.decks, deck] }));
      },

      getDeck: (id: string) => {
        const deck = get().decks.find((d) => d.id === id);
        return deck;
      },
    }),
    { name: STORAGE_KEY }
  )
);
