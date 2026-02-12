"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStudyStore } from "@/stores/study-store";
import type { Deck } from "@/types/deck";

export interface DeckCardProps {
  deck: Deck;
  /** Show creator name and "Add to my decks" (for explored decks) */
  showCreator?: boolean;
}

export function DeckCard({ deck, showCreator }: DeckCardProps) {
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const addDeck = useStudyStore((s) => s.addDeck);

  const cardCount = deck.cards.length;

  const handleAddToMyDecks = async () => {
    if (adding || added) return;
    setAdding(true);
    try {
      await addDeck({ title: deck.title, cards: deck.cards });
      setAdded(true);
    } catch {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{deck.title}</CardTitle>
        <CardDescription>
          {cardCount} {cardCount === 1 ? "card" : "cards"}
          {showCreator && deck.creatorName && (
            <> · by {deck.creatorName}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {showCreator && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddToMyDecks}
            disabled={added || adding}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {added ? "Added" : adding ? "Adding…" : "Add to my decks"}
          </Button>
        )}
        <Link href={`/study/${deck.id}/learn`}>
          <Button>Study</Button>
        </Link>
        {deck.cards.length >= 4 && (
          <Link href={`/study/${deck.id}/quiz`}>
            <Button variant="outline">Quiz</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
