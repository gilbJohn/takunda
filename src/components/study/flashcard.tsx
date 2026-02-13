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
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-center text-lg text-slate-100">
            {card.front || "No question"}
          </p>
          <p className="mt-2 text-sm text-emerald-500/80">Click to flip</p>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-center text-lg text-slate-100">
            {card.back || "No answer"}
          </p>
          <p className="mt-2 text-sm text-emerald-500/80">
            Click to flip back
          </p>
        </div>
      </div>
    </div>
  );
}
