"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Card } from "@/types/deck";

export interface FlashcardProps {
  card: Card;
  className?: string;
}

export function Flashcard({ card, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("cursor-pointer [perspective:1000px]", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative h-64 w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-950"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-center text-lg text-gray-900 dark:text-gray-50">
            {card.front || "No question"}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click to flip
          </p>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-center text-lg text-gray-900 dark:text-gray-50">
            {card.back || "No answer"}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click to flip back
          </p>
        </div>
      </div>
    </div>
  );
}
