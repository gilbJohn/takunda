"use client";

import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player } from "./types";

interface ResultsViewProps {
  winner: Player | null;
  onPlayAgain: () => void;
  title?: string;
}

export function ResultsView({
  winner,
  onPlayAgain,
  title = "Last One Standing",
}: ResultsViewProps) {
  return (
    <div className="mx-auto max-w-md space-y-8 p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        {title} – Game Over
      </h2>
      {winner ? (
        <div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-8 dark:border-amber-400 dark:bg-amber-950/40">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-white dark:bg-amber-600">
              <Trophy className="h-10 w-10" />
            </div>
          </div>
          <p className="text-lg font-medium text-amber-800 dark:text-amber-200">
            Winner
          </p>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            {winner.name}
          </p>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            Last one standing!
          </p>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-gray-300 bg-gray-50 p-8 dark:border-gray-600 dark:bg-gray-900/50">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            No winner
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Everyone was eliminated or the game ended early.
          </p>
        </div>
      )}
      <Button onClick={onPlayAgain} className="w-full">
        Play again
      </Button>
    </div>
  );
}
