"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface FlashcardSwipeNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrev: () => void;
  onNext: () => void;
}

export function FlashcardSwipeNavigation({
  currentIndex,
  totalCards,
  onPrev,
  onNext,
}: FlashcardSwipeNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm font-medium text-slate-400">
        Card {currentIndex + 1} of {totalCards}
      </span>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={currentIndex >= totalCards - 1}
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
