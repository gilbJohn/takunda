"use client";

import Link from "next/link";
import { useStudyStore } from "@/stores/study-store";
import { DeckCard } from "@/components/study/deck-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle } from "lucide-react";

export default function StudyPage() {
  const decks = useStudyStore((s) => s.decks);

  return (
    <div className="container max-w-4xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Study"
          description="Your flashcard decks"
        />
        <Link href="/study/create">
          <Button>Create deck</Button>
        </Link>
      </div>
      {decks.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No decks yet"
          description="Create your first flashcard deck to get started."
          action={
            <Link href="/study/create">
              <Button>Create deck</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
              <HelpCircle className="h-5 w-5" />
              Quizzes
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Quizzes from your decks — coming soon. You&apos;ll be able to test yourself with multiple-choice and written questions generated from your flashcards.
            </p>
            <div className="flex flex-wrap gap-2">
              {decks.map((deck) => (
                <Button key={deck.id} variant="outline" size="sm" disabled>
                  Quiz: {deck.title}
                </Button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
