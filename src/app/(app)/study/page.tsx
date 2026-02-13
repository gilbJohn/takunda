"use client";

import Link from "next/link";
import { useStudyStore } from "@/stores/study-store";
import { DeckCard } from "@/components/study/deck-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, Compass } from "lucide-react";

export default function StudyPage() {
  const decks = useStudyStore((s) => s.decks);

  return (
    <PageContainer maxWidth="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Study" description="Your flashcard decks" />
        <div className="flex gap-2">
          <Link href="/study/explore">
            <Button variant="outline">
              <Compass className="mr-2 h-4 w-4" />
              Explore decks
            </Button>
          </Link>
          <Link href="/study/create">
            <Button>Create deck</Button>
          </Link>
        </div>
      </div>
      {decks.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No decks yet"
          description="Create your first flashcard deck, or explore decks made by other students."
          action={
            <div className="flex flex-wrap gap-2">
              <Link href="/study/explore">
                <Button variant="outline">Explore decks</Button>
              </Link>
              <Link href="/study/create">
                <Button>Create deck</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
              <HelpCircle className="h-5 w-5 text-emerald-500" />
              Quizzes
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Test yourself with multiple-choice quizzes. Easy mode has 2 choices per
              question, hard mode has 4. Decks need at least 4 cards to quiz.
            </p>
            <div className="flex flex-wrap gap-2">
              {decks.map((deck) => {
                const canQuiz = deck.cards.length >= 4;
                const btn = (
                  <Button variant="outline" size="sm" disabled={!canQuiz}>
                    Quiz: {deck.title}
                  </Button>
                );
                return canQuiz ? (
                  <Link key={deck.id} href={`/study/${deck.id}/quiz`}>
                    {btn}
                  </Link>
                ) : (
                  <span key={deck.id}>{btn}</span>
                );
              })}
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
