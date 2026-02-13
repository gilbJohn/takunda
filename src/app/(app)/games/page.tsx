"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useStudyStore } from "@/stores/study-store";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Swords, MessageSquare } from "lucide-react";

const JEOPARDY_MIN_CARDS = 25;
const LAST_ONE_STANDING_MIN_CARDS = 5;

export default function GamesPage() {
  const user = useAuthStore((s) => s.user);
  const decks = useStudyStore((s) => s.decks);
  const eligibleForJeopardy = decks.filter((d) => d.cards.length >= JEOPARDY_MIN_CARDS);
  const eligibleForLOS = decks.filter(
    (d) => d.cards.length >= LAST_ONE_STANDING_MIN_CARDS
  );

  if (!user) return null;

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Games" description="Study games and trivia" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="bg-amber-500/15">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              Jeopardy
            </CardTitle>
            <CardDescription>
              Classic trivia board game from your flashcards. Pick a category and point
              value, answer correctly to score!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {eligibleForJeopardy.length > 0 ? (
              <Link href="/games/jeopardy">
                <Button className="w-full">Play Jeopardy</Button>
              </Link>
            ) : (
              <p className="mb-4 text-sm text-slate-400">
                Needs a deck with at least {JEOPARDY_MIN_CARDS} cards.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="bg-rose-500/15">
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-6 w-6 text-rose-500" />
              Last One Standing
            </CardTitle>
            <CardDescription>
              One screen, pass-and-play. When it&apos;s your turn, answer – wrong = out.
              Last one standing wins!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {eligibleForLOS.length > 0 ? (
              <Link href="/games/last-one-standing">
                <Button className="w-full">Play</Button>
              </Link>
            ) : (
              <p className="mb-4 text-sm text-slate-400">
                Needs a deck with at least {LAST_ONE_STANDING_MIN_CARDS} cards.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="bg-emerald-600/15">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
              Explain It To Win It
            </CardTitle>
            <CardDescription>
              Type an explanation for a term, vote on the best answer, and reveal the
              winner!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Link href="/games/explain-to-win-it">
              <Button className="w-full">Play</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      {eligibleForJeopardy.length === 0 && eligibleForLOS.length === 0 && (
        <p className="mt-8 text-sm text-slate-400">
          Create or explore decks to play games. Jeopardy needs 25+ cards, Last One
          Standing needs 5+.{" "}
          <Link
            href="/study"
            className="font-medium text-emerald-500 hover:text-emerald-400 hover:underline"
          >
            Go to Study
          </Link>
        </p>
      )}
    </PageContainer>
  );
}
