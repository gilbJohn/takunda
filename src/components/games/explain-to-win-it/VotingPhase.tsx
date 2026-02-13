"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Vote } from "lucide-react";
import type { Submission } from "./types";

interface VotingPhaseProps {
  term: string;
  currentVoterName: string;
  /** Submissions to vote on - excludes the current voter's own (can't vote for yourself) */
  submissions: { id: string; explanation: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSubmitVote: () => void;
}

export function VotingPhase({
  term,
  currentVoterName,
  submissions,
  selectedId,
  onSelect,
  onSubmitVote,
}: VotingPhaseProps) {
  return (
    <Card className="max-w-md mx-auto p-6 space-y-6 shadow-lg border-2">
      <header className="space-y-2 text-center border-b pb-4">
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <Vote className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Pass the computer to...
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {currentVoterName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Explain: &quot;{term}&quot;
        </p>
      </header>

      <div className="space-y-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Vote for the best explanation (yours is hidden – you can&apos;t vote for
          yourself)
        </p>
        <div className="space-y-2">
          {submissions.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelect(sub.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedId === sub.id
                  ? "border-gray-900 bg-gray-100 dark:border-gray-100 dark:bg-gray-800 ring-2 ring-gray-900 dark:ring-gray-100"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <p className="text-sm font-medium leading-relaxed">{sub.explanation}</p>
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={onSubmitVote} disabled={!selectedId}>
        Submit Vote
      </Button>
    </Card>
  );
}
