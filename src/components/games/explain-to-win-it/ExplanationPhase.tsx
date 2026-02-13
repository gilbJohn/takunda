"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { Term } from "./types";

interface ExplanationPhaseProps {
  term: Term;
  currentPlayerName: string;
  timeLeft: number;
  timerTotal: number;
  explanation: string;
  onExplanationChange: (value: string) => void;
  onSubmit: () => void;
  isLocked: boolean;
}

export function ExplanationPhase({
  term,
  currentPlayerName,
  timeLeft,
  timerTotal,
  explanation,
  onExplanationChange,
  onSubmit,
  isLocked,
}: ExplanationPhaseProps) {
  const progressValue = (timeLeft / timerTotal) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <Card className="max-w-md mx-auto p-6 space-y-6 shadow-lg border-2">
      <header className="space-y-2 text-center border-b pb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Pass the computer to...
        </p>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {currentPlayerName}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{term.category}</p>
        <h3 className="text-2xl font-bold tracking-tight">{term.term}</h3>
      </header>

      <div className="space-y-4">
        {/* Countdown timer - highly visible */}
        <div className="space-y-2">
          <div
            className={`text-center text-2xl font-mono font-bold py-3 px-4 rounded-lg transition-colors ${
              isUrgent
                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 animate-pulse"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            }`}
          >
            {timeLeft}s remaining
          </div>
          <Progress value={progressValue} max={100} className="h-3" />
        </div>

        <Textarea
          className="min-h-[160px] text-base leading-relaxed resize-none"
          rows={5}
          placeholder="Type your explanation (others won't see who wrote what)..."
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          disabled={isLocked}
          readOnly={isLocked}
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={onSubmit}
        disabled={isLocked || !explanation.trim()}
      >
        {isLocked ? "Time's up!" : "Submit Explanation"}
      </Button>
    </Card>
  );
}
