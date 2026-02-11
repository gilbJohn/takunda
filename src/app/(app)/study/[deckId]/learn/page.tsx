"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useStudyStore } from "@/stores/study-store";
import { Flashcard } from "@/components/study/flashcard";
import { FlashcardSwipeNavigation } from "@/components/study/flashcard-swipe-navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export default function StudyLearnPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;
  const getDeck = useStudyStore((s) => s.getDeck);

  const deck = getDeck(deckId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!deck) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader
          title="Deck not found"
          description="This deck could not be found."
        />
        <Link href="/study">
          <Button variant="outline">Back to Study</Button>
        </Link>
      </div>
    );
  }

  const cards = deck.cards;
  const currentCard = cards[currentIndex];

  if (cards.length === 0) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader
          title={deck.title}
          description="This deck has no cards yet."
        />
        <Link href="/study">
          <Button variant="outline">Back to Study</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <PageHeader
        title={deck.title}
        description={`Card ${currentIndex + 1} of ${cards.length}`}
      />
      <div className="space-y-8">
        <Flashcard key={currentCard.id} card={currentCard} />
        <FlashcardSwipeNavigation
          currentIndex={currentIndex}
          totalCards={cards.length}
          onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() =>
            setCurrentIndex((i) => Math.min(cards.length - 1, i + 1))
          }
        />
      </div>
      <Link href="/study">
        <Button variant="outline">Back to decks</Button>
      </Link>
    </div>
  );
}
