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
import { Swords } from "lucide-react";

const MIN_CARDS = 5;

export default function LastOneStandingSelectPage() {
  const decks = useStudyStore((s) => s.decks);
  const eligibleDecks = decks.filter((d) => d.cards.length >= MIN_CARDS);

  return (
    <div className="container max-w-4xl space-y-8 p-8">
      <PageHeader
        title="Last One Standing"
        description="Choose a deck to play. Battle royale quiz – last player standing wins!"
      />
      {eligibleDecks.length === 0 ? (
        <EmptyState
          icon={<Swords className="h-12 w-12" />}
          title="No decks ready"
          description={`You need a deck with at least ${MIN_CARDS} cards. Create or explore decks to get started.`}
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
              <CardHeader className="bg-rose-500/10 dark:bg-rose-500/20">
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  {deck.title}
                </CardTitle>
                <CardDescription>
                  {deck.cards.length} cards · One screen, pass-and-play
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Link href={`/games/last-one-standing/${deck.id}`}>
                  <Button className="w-full">Play</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {decks.length > 0 && eligibleDecks.length < decks.length && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {decks.filter((d) => d.cards.length < MIN_CARDS).length} deck(s) need
          more cards to play Last One Standing.
        </p>
      )}
      <Link href="/games">
        <Button variant="ghost">Back to Games</Button>
      </Link>
    </div>
  );
}
