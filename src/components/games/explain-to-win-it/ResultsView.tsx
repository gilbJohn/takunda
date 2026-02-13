"use client";

import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Player } from "./types";

interface ResultsViewProps {
  winner: Player | null;
  winningExplanation: string;
  isLastRound: boolean;
  onNextRound: () => void;
  onFinishGame: () => void;
}

export function ResultsView({
  winner,
  winningExplanation,
  isLastRound,
  onNextRound,
  onFinishGame,
}: ResultsViewProps) {
  return (
    <Card className="max-w-md mx-auto p-6 space-y-6 shadow-xl border-2">
      <header className="text-center space-y-2">
        <Trophy className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="text-2xl font-bold">Round Winner!</h2>
      </header>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Best explanation by
          </p>
          <p className="text-xl font-bold">{winner ? winner.name : "No one"}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Winning explanation:
          </p>
          <p className="text-base leading-relaxed">{winningExplanation}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isLastRound ? (
          <Button size="lg" className="w-full" onClick={onFinishGame}>
            Finish Game
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={onNextRound}>
            Next Round
          </Button>
        )}
      </div>
    </Card>
  );
}
