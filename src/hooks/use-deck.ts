"use client";

import { useState, useEffect } from "react";
import { useStudyStore } from "@/stores/study-store";
import type { Deck } from "@/types/deck";

/**
 * Fetches a deck by ID. Checks the study store first (my decks),
 * then fetches via API route if not found (e.g. explored decks).
 * Uses fetch to avoid bundling Supabase in client pages.
 */
export function useDeck(deckId: string | undefined) {
  const getDeckFromStore = useStudyStore((s) => s.getDeck);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) {
      setDeck(null);
      setLoading(false);
      return;
    }

    const fromStore = getDeckFromStore(deckId);
    if (fromStore) {
      setDeck(fromStore);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/decks/${deckId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((fetched: Deck | null) => {
        if (!cancelled) {
          setDeck(fetched ?? null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setDeck(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deckId, getDeckFromStore]);

  return { deck, loading };
}
