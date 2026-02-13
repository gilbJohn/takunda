"use client";

import { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Player, Question } from "./types";

interface GameViewProps {
  question: Question;
  players: Player[];
  eliminatedThisRound: string[];
  timeRemaining: number;
  timerTotal: number;
  onAnswer: (choice: string) => void;
  /** Whether the current round has ended (showing results) */
  roundEnded: boolean;
  /** The correct answer (shown after round ends) */
  correctAnswer?: string;
  /** Whose turn to answer (for pass-and-play) */
  currentRespondent?: Player | null;
}

export function GameView({
  question,
  players,
  eliminatedThisRound,
  timeRemaining,
  timerTotal,
  onAnswer,
  roundEnded,
  correctAnswer,
  currentRespondent,
}: GameViewProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const choices = useMemo(
    () => question.choices ?? [question.correctAnswer],
    [question.choices, question.correctAnswer]
  );
  const shuffledChoices = useMemo(
    () => [...choices].sort(() => Math.random() - 0.5),
    [choices]
  );

  const handleChoice = (choice: string) => {
    if (roundEnded || selectedChoice) return;
    setSelectedChoice(choice);
    onAnswer(choice);
  };

  const alivePlayers = players.filter((p) => p.isAlive);
  const timerPercent = (timeRemaining / timerTotal) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      {/* Player dots - elimination visualization */}
      <div className="flex flex-wrap justify-center gap-2">
        {players.map((p) => {
          const isEliminated = !p.isAlive;
          const justEliminated = eliminatedThisRound.includes(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 transition-all duration-500",
                isEliminated ? "scale-75 opacity-40" : "scale-100 opacity-100",
                justEliminated &&
                  "animate-eliminate-pulse ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-950"
              )}
              title={p.name}
            >
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  isEliminated
                    ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    : "bg-emerald-500 text-white dark:bg-emerald-600",
                  justEliminated && "bg-red-500 dark:bg-red-600"
                )}
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timer bar */}
      {!roundEnded && (
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-amber-500 transition-all duration-1000 ease-linear dark:bg-amber-600"
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      {/* Question */}
      <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        {currentRespondent && !roundEnded && (
          <p className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            {currentRespondent.name}, your turn!
          </p>
        )}
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 sm:text-xl">
          {question.text}
        </p>
      </div>

      {/* Choices */}
      <div className="grid gap-3 sm:grid-cols-2">
        {shuffledChoices.map((choice) => {
          const isCorrect = choice === question.correctAnswer;
          const isSelected = selectedChoice === choice;
          const showResult = roundEnded || selectedChoice;

          return (
            <button
              key={choice}
              type="button"
              onClick={() => handleChoice(choice)}
              disabled={!!selectedChoice}
              className={cn(
                "flex min-h-14 items-center justify-between gap-4 rounded-lg border-2 px-4 py-3 text-left transition-all",
                "disabled:cursor-default disabled:pointer-events-none",
                !showResult &&
                  "border-gray-200 hover:border-amber-400 hover:bg-amber-50 dark:border-gray-700 dark:hover:border-amber-600 dark:hover:bg-amber-950/30",
                showResult &&
                  isCorrect &&
                  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400",
                showResult &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-500 bg-red-50 dark:bg-red-950/40 dark:border-red-400",
                showResult &&
                  !isSelected &&
                  !isCorrect &&
                  "border-gray-200 opacity-60 dark:border-gray-700"
              )}
            >
              <span className="font-medium">{choice}</span>
              {showResult && (
                <span className="shrink-0">
                  {isCorrect ? (
                    <Check
                      className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={3}
                    />
                  ) : isSelected ? (
                    <X
                      className="h-6 w-6 text-red-600 dark:text-red-400"
                      strokeWidth={3}
                    />
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {roundEnded && correctAnswer && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Correct:{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {correctAnswer}
          </span>
        </p>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {alivePlayers.length} player{alivePlayers.length !== 1 ? "s" : ""} remaining
      </p>
    </div>
  );
}
