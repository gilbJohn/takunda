"use client";

import Link from "next/link";
import { useStudyStore } from "@/stores/study-store";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";

const MIN_CARDS = 25; // 5 categories × 5 questions

export default function JeopardySelectPage() {
  const decks = useStudyStore((s) => s.decks);
  const eligibleDecks = decks.filter((d) => d.cards.length >= MIN_CARDS);

  return (
    <div className="container max-w-4xl space-y-8 p-8">
      <PageHeader
        title="Jeopardy"
        description="Choose a deck to play Jeopardy. You need at least 25 cards (5 categories × 5 questions)."
      />
      {eligibleDecks.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-12 w-12" />}
          title="No decks ready"
          description={`You need a deck with at least ${MIN_CARDS} cards to play Jeopardy. Create or explore decks to get started.`}
          action={
            <div className="flex flex-wrap gap-2">
              <Link href="/study">
                <Button variant="outline">My decks</Button>
              </Link>
              <Link href="/study/explore">
                <Button>Explore decks</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {eligibleDecks.map((deck) => (
            <Card key={deck.id} className="overflow-hidden">
              <CardHeader className="bg-amber-500/10 dark:bg-amber-500/20">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  {deck.title}
                </CardTitle>
                <CardDescription>
                  {deck.cards.length} cards · 5 categories × 5 questions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Link href={`/games/jeopardy/${deck.id}`}>
                  <Button className="w-full">Play Jeopardy</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {decks.length > 0 && eligibleDecks.length < decks.length && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {decks.filter((d) => d.cards.length < MIN_CARDS).length} deck(s) need
          more cards to play Jeopardy.
        </p>
      )}
      <Link href="/games">
        <Button variant="ghost">Back to Games</Button>
      </Link>
    </div>
  );
}
