import { API_CONFIG } from "@/lib/config/api";
import { apiClient } from "./client";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Deck, Card } from "@/types/deck";
import { MOCK_DECKS } from "@/data/mock";

async function getDecksMock(): Promise<Deck[]> {
  return MOCK_DECKS;
}

async function getDecksSupabase(): Promise<Deck[]> {
  if (!supabase) return [];
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: decks } = await supabase
    .from("decks")
    .select("id, title, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  if (!decks?.length) return [];

  const deckIds = decks.map((d) => d.id);
  const { data: cards } = await supabase
    .from("cards")
    .select("id, deck_id, front, back")
    .in("deck_id", deckIds);

  const cardsByDeck = (cards ?? []).reduce<Record<string, Card[]>>((acc, c) => {
    if (!acc[c.deck_id]) acc[c.deck_id] = [];
    acc[c.deck_id].push({ id: c.id, front: c.front, back: c.back });
    return acc;
  }, {});

  return decks.map((d) => ({
    id: d.id,
    title: d.title,
    cards: cardsByDeck[d.id] ?? [],
    createdAt: d.created_at,
  }));
}

async function getDecksApi(): Promise<Deck[]> {
  return apiClient.get<Deck[]>("/decks");
}

export async function getDecks(): Promise<Deck[]> {
  if (API_CONFIG.useSupabase) return getDecksSupabase();
  if (API_CONFIG.useMock) return getDecksMock();
  return getDecksApi();
}

async function getDeckMock(id: string): Promise<Deck | null> {
  return MOCK_DECKS.find((d) => d.id === id) ?? null;
}

async function getDeckSupabase(id: string): Promise<Deck | null> {
  if (!supabase) return null;
  const { data: deck } = await supabase
    .from("decks")
    .select("id, title, created_at")
    .eq("id", id)
    .single();
  if (!deck) return null;

  const { data: cards } = await supabase
    .from("cards")
    .select("id, front, back")
    .eq("deck_id", id)
    .order("created_at", { ascending: true });

  return {
    id: deck.id,
    title: deck.title,
    cards: (cards ?? []).map((c) => ({ id: c.id, front: c.front, back: c.back })),
    createdAt: deck.created_at,
  };
}

async function getDeckApi(id: string): Promise<Deck | null> {
  try {
    return await apiClient.get<Deck>(`/decks/${id}`);
  } catch {
    return null;
  }
}

export async function getDeck(id: string): Promise<Deck | null> {
  if (API_CONFIG.useSupabase) return getDeckSupabase(id);
  if (API_CONFIG.useMock) return getDeckMock(id);
  return getDeckApi(id);
}

async function createDeckMock(deck: Deck): Promise<Deck> {
  return { ...deck, id: deck.id || `deck-${Date.now()}` };
}

async function createDeckSupabase(deck: Omit<Deck, "id">): Promise<Deck> {
  if (!supabase) throw new Error("Supabase not configured");
  let { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    const { data: { session: refreshed } } = await supabase.auth.refreshSession();
    session = refreshed;
  }
  if (!session?.user) {
    useAuthStore.setState({ user: null, isLoggedIn: false });
    throw new Error("Not authenticated. Please sign in again.");
  }

  const { data: newDeck, error: deckError } = await supabase
    .from("decks")
    .insert({ user_id: session.user.id, title: deck.title })
    .select("id, title, created_at")
    .single();

  if (deckError || !newDeck) throw new Error(deckError?.message ?? "Failed to create deck");

  if (deck.cards.length > 0) {
    const cardsToInsert = deck.cards.map((c) => ({
      deck_id: newDeck.id,
      front: c.front,
      back: c.back,
    }));
    const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert);
    if (cardsError) throw new Error(cardsError.message);
  }

  const { data: cards } = await supabase
    .from("cards")
    .select("id, front, back")
    .eq("deck_id", newDeck.id)
    .order("created_at", { ascending: true });

  return {
    id: newDeck.id,
    title: newDeck.title,
    cards: (cards ?? []).map((c) => ({ id: c.id, front: c.front, back: c.back })),
    createdAt: newDeck.created_at,
  };
}

async function createDeckApi(deck: Omit<Deck, "id">): Promise<Deck> {
  return apiClient.post<Deck>("/decks", deck);
}

async function getExploreDecksSupabase(): Promise<Deck[]> {
  if (!supabase) return [];
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: decks } = await supabase
    .from("decks")
    .select("id, title, created_at, user_id")
    .neq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!decks?.length) return [];

  const userIds = [...new Set(decks.map((d) => d.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", userIds);

  const nameById = (profiles ?? []).reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {});

  const deckIds = decks.map((d) => d.id);
  const { data: cards } = await supabase
    .from("cards")
    .select("id, deck_id, front, back")
    .in("deck_id", deckIds);

  const cardsByDeck = (cards ?? []).reduce<Record<string, Card[]>>((acc, c) => {
    if (!acc[c.deck_id]) acc[c.deck_id] = [];
    acc[c.deck_id].push({ id: c.id, front: c.front, back: c.back });
    return acc;
  }, {});

  return decks.map((d) => ({
    id: d.id,
    title: d.title,
    cards: cardsByDeck[d.id] ?? [],
    createdAt: d.created_at,
    creatorName: nameById[d.user_id] ?? "Unknown",
  }));
}

async function getExploreDecksMock(): Promise<Deck[]> {
  // Return some "other" decks for mock mode
  return [
    {
      id: "explore-1",
      title: "Data Structures - Linked Lists",
      cards: [
        { id: "e1", front: "What is a linked list?", back: "A linear data structure where elements are linked via pointers." },
        { id: "e2", front: "Singly vs doubly linked?", back: "Singly has one pointer (next); doubly has prev and next." },
        { id: "e3", front: "Time complexity of insert at head?", back: "O(1)" },
        { id: "e4", front: "Time complexity of search?", back: "O(n)" },
      ],
      creatorName: "Sam Taylor",
    },
    {
      id: "explore-2",
      title: "Biology - Genetics Basics",
      cards: [
        { id: "e5", front: "What is DNA?", back: "Deoxyribonucleic acid; carries genetic instructions." },
        { id: "e6", front: "What is a gene?", back: "A segment of DNA that codes for a trait." },
        { id: "e7", front: "What is meiosis?", back: "Cell division that produces gametes with half the chromosomes." },
        { id: "e8", front: "What is mitosis?", back: "Cell division that produces two identical daughter cells." },
      ],
      creatorName: "Jordan Lee",
    },
    {
      id: "explore-3",
      title: "Calculus - Derivatives",
      cards: [
        { id: "e9", front: "Derivative of x^n?", back: "n * x^(n-1)" },
        { id: "e10", front: "Derivative of e^x?", back: "e^x" },
        { id: "e11", front: "Product rule?", back: "(fg)' = f'g + fg'" },
        { id: "e12", front: "Chain rule?", back: "(f(g(x)))' = f'(g(x)) * g'(x)" },
      ],
      creatorName: "Alex Johnson",
    },
  ];
}

async function getExploreDecksApi(): Promise<Deck[]> {
  try {
    return await apiClient.get<Deck[]>("/decks/explore");
  } catch {
    return [];
  }
}

export async function getExploreDecks(): Promise<Deck[]> {
  if (API_CONFIG.useSupabase) return getExploreDecksSupabase();
  if (API_CONFIG.useMock) return getExploreDecksMock();
  return getExploreDecksApi();
}

export async function createDeck(
  deck: Omit<Deck, "id"> | Deck
): Promise<Deck> {
  const payload = { title: deck.title, cards: deck.cards };
  if (API_CONFIG.useSupabase) return createDeckSupabase(payload);
  if (API_CONFIG.useMock) {
    const newDeck: Deck = {
      ...deck,
      id: ("id" in deck && deck.id) ? deck.id : `deck-${Date.now()}`,
    };
    return createDeckMock(newDeck);
  }
  return createDeckApi(payload);
}
