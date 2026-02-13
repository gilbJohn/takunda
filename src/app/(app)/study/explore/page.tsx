"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getExploreDecks } from "@/lib/api";
import { DeckCard } from "@/components/study/deck-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Compass, BookOpen } from "lucide-react";
import type { Deck } from "@/types/deck";

export default function ExploreDecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExploreDecks().then((d) => {
      setDecks(d);
      setLoading(false);
    });
  }, []);

  return (
    <PageContainer maxWidth="lg">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Explore decks"
          description="Study from decks created by other students"
        />
        <Link href="/study">
          <Button variant="outline">My decks</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-700 bg-slate-800/50"
            />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="No decks to explore yet"
          description="Decks from other users will appear here. Create and share your own to get started!"
          action={
            <Link href="/study/create">
              <Button>Create a deck</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} showCreator />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
