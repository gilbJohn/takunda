"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useDeck } from "@/hooks/use-deck";
import { LastOneStanding } from "@/components/games/last-one-standing";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import type { Question } from "@/components/games/last-one-standing";

const MIN_QUESTIONS = 5;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildQuestionsFromDeck(
  cards: { id: string; front: string; back: string }[]
): Question[] {
  return cards.map((card) => {
    const others = cards.filter((c) => c.id !== card.id);
    const wrongAnswers = shuffle(others)
      .slice(0, 3)
      .map((c) => c.back);
    const choices = shuffle([card.back, ...wrongAnswers]);
    return {
      id: card.id,
      text: card.front,
      correctAnswer: card.back,
      choices,
    };
  });
}

export default function LastOneStandingGamePage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { deck, loading } = useDeck(deckId);

  const externalQuestions: Question[] =
    deck && deck.cards.length >= MIN_QUESTIONS
      ? buildQuestionsFromDeck(deck.cards)
      : [];

  if (loading) {
    return (
      <div className="container max-w-4xl space-y-8 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-96 animate-pulse rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="container max-w-4xl space-y-8 p-8">
        <PageHeader title="Deck not found" description="This deck could not be found." />
        <Link href="/games/last-one-standing">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  if (deck.cards.length < MIN_QUESTIONS) {
    return (
      <div className="container max-w-4xl space-y-8 p-8">
        <PageHeader
          title="Not enough cards"
          description={`Last One Standing needs at least ${MIN_QUESTIONS} cards. This deck has ${deck.cards.length}.`}
        />
        <Link href="/games/last-one-standing">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Last One Standing: ${deck.title}`}
          description="Battle royale quiz – last player standing wins!"
        />
        <Link href="/games/last-one-standing">
          <Button variant="ghost" size="sm">
            Quit
          </Button>
        </Link>
      </div>
      <LastOneStanding
        externalQuestions={externalQuestions}
        title={`${deck.title}`}
        config={{
          timerPerQuestion: 15,
          eliminationRate: 1,
          minPlayers: 2,
          maxQuestions: 30,
        }}
        onGameEnd={(winner) => {
          if (winner) {
            console.log("Winner:", winner.name);
          }
        }}
      />
    </div>
  );
}
