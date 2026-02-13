"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDeck } from "@/hooks/use-deck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

const POINTS = [100, 200, 300, 400, 500];
const CATEGORY_COUNT = 5;
const MIN_CARDS = 25;

type Player = { id: string; name: string; score: number };

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function JeopardyGamePage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { deck, loading } = useDeck(deckId);

  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [board, setBoard] = useState<
    { cardId: string; question: string; correctAnswer: string }[][] | null
  >(null);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [selectedCell, setSelectedCell] = useState<{ cat: number; row: number } | null>(
    null
  );
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const builtBoard = useMemo(() => {
    if (!deck || deck.cards.length < MIN_CARDS) return null;
    void playKey; // Force rebuild when game restarts
    const shuffled = shuffle([...deck.cards]);
    const cards = shuffled.slice(0, MIN_CARDS);
    const perCategory = Math.floor(cards.length / CATEGORY_COUNT);
    const grid: { cardId: string; question: string; correctAnswer: string }[][] = [];

    for (let c = 0; c < CATEGORY_COUNT; c++) {
      const colCards = cards.slice(c * perCategory, (c + 1) * perCategory);
      const column = colCards.map((card) => ({
        cardId: card.id,
        question: card.front,
        correctAnswer: card.back,
      }));
      grid.push(column);
    }
    return grid;
  }, [deck, playKey]);

  useEffect(() => {
    if (builtBoard) setBoard(builtBoard);
  }, [builtBoard]);

  const actualBoard = board ?? builtBoard ?? [];
  const currentClue = selectedCell
    ? actualBoard[selectedCell.cat]?.[selectedCell.row]
    : null;
  const currentPoints = selectedCell ? (POINTS[selectedCell.row] ?? 100) : 0;

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    setPlayers((p) => [...p, { id: `p-${Date.now()}`, name, score: 0 }]);
    setNewPlayerName("");
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((p) => p.filter((x) => x.id !== id));
  };

  const handleCellClick = (cat: number, row: number) => {
    const cell = actualBoard[cat]?.[row];
    if (!cell || answered[`${cat}-${row}`]) return;
    setSelectedCell({ cat, row });
    setAnswerRevealed(false);
  };

  const handleAward = (playerId: string, correct: boolean) => {
    if (!selectedCell) return;
    const pts = correct ? currentPoints : -currentPoints;
    setPlayers((p) =>
      p.map((pl) =>
        pl.id === playerId ? { ...pl, score: Math.max(0, pl.score + pts) } : pl
      )
    );
    setAnswered((a) => ({ ...a, [`${selectedCell.cat}-${selectedCell.row}`]: true }));
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setSelectedCell(null);
    setAnswerRevealed(false);
  };

  const totalCells = actualBoard.reduce((sum, col) => sum + col.length, 0);
  const answeredCount = Object.keys(answered).length;
  const isGameOver = totalCells > 0 && answeredCount >= totalCells;
  const topScore = players.length ? Math.max(...players.map((p) => p.score)) : 0;

  if (loading) {
    return (
      <div className="container max-w-4xl space-y-8 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-96 animate-pulse rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="container max-w-4xl space-y-8 p-8">
        <PageHeader title="Deck not found" description="This deck could not be found." />
        <Link href="/games/jeopardy">
          <Button variant="outline">Back to Jeopardy</Button>
        </Link>
      </div>
    );
  }

  if (deck.cards.length < MIN_CARDS) {
    return (
      <div className="container max-w-4xl space-y-8 p-8">
        <PageHeader
          title="Not enough cards"
          description={`Jeopardy needs at least ${MIN_CARDS} cards. This deck has ${deck.cards.length}.`}
        />
        <Link href="/games/jeopardy">
          <Button variant="outline">Back to Jeopardy</Button>
        </Link>
      </div>
    );
  }

  // Player setup – must add at least one player before starting
  if (!gameStarted) {
    return (
      <div className="container max-w-lg space-y-8 p-8">
        <PageHeader
          title={`Jeopardy: ${deck.title}`}
          description="Add players to get started. You need at least one player."
        />
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
            />
            <Button onClick={handleAddPlayer} type="button">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900/50"
              >
                <span className="font-medium">{p.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePlayer(p.id)}
                  className="h-8 w-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => setGameStarted(true)}
            disabled={players.length < 1}
            className="w-full"
          >
            Start game
          </Button>
        </div>
        <Link href="/games/jeopardy">
          <Button variant="ghost">Back to deck selection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl space-y-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={`Jeopardy: ${deck.title}`}
          description={`${answeredCount}/${totalCells} clues answered`}
        />
        <div className="flex items-center gap-4">
          <div className="flex flex-wrap gap-3">
            {players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "rounded-lg border-2 px-4 py-2",
                  p.score === topScore && topScore > 0
                    ? "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/40"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50"
                )}
              >
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                  {p.name}
                </span>
                <span className="font-bold text-amber-800 dark:text-amber-200">
                  ${p.score}
                </span>
              </div>
            ))}
          </div>
          <Link href="/games/jeopardy">
            <Button variant="ghost" size="sm">
              Quit
            </Button>
          </Link>
        </div>
      </div>

      {/* Jeopardy board */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[600px] gap-1"
          style={{
            gridTemplateColumns: `repeat(${CATEGORY_COUNT}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: CATEGORY_COUNT }).map((_, c) => (
            <div
              key={c}
              className="flex h-14 items-center justify-center rounded-t-lg bg-blue-800 px-2 py-2 text-center font-bold text-white dark:bg-blue-900"
            >
              Category {c + 1}
            </div>
          ))}
          {POINTS.map((pts, row) =>
            Array.from({ length: CATEGORY_COUNT }).map((_, cat) => {
              const cell = actualBoard[cat]?.[row];
              const isAnswered = cell ? answered[`${cat}-${row}`] : true;
              return (
                <button
                  key={`${cat}-${row}`}
                  type="button"
                  onClick={() => handleCellClick(cat, row)}
                  disabled={!cell || isAnswered}
                  className={cn(
                    "flex h-16 min-h-[4rem] items-center justify-center rounded-lg border-2 font-bold transition-all",
                    isAnswered || !cell
                      ? "cursor-default border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                      : "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200 hover:ring-2 hover:ring-amber-400 dark:border-amber-500 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-800/50"
                  )}
                >
                  {isAnswered || !cell ? "" : `$${pts}`}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Clue modal – Jeopardy style: show clue, reveal answer, then manually award */}
      <Dialog open={!!selectedCell} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedCell && `$${currentPoints}`}
            </DialogTitle>
          </DialogHeader>
          {currentClue && (
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {currentClue.question}
              </p>
              {!answerRevealed ? (
                <Button onClick={() => setAnswerRevealed(true)} className="w-full">
                  Reveal answer
                </Button>
              ) : (
                <>
                  <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-4 dark:border-emerald-400 dark:bg-emerald-950/40">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      Correct response:
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                      {currentClue.correctAnswer}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Who got it right?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {players.map((p) => (
                        <Button
                          key={p.id}
                          variant="outline"
                          onClick={() => handleAward(p.id, true)}
                          className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                        >
                          {p.name} +${currentPoints}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Who answered wrong? (deducts ${currentPoints})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {players.map((p) => (
                        <Button
                          key={p.id}
                          variant="ghost"
                          onClick={() => handleAward(p.id, false)}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          {p.name} −${currentPoints}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleCloseModal}
                      className="mt-2"
                    >
                      No one / Skip
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Game over */}
      {isGameOver && (
        <div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-6 dark:border-amber-400 dark:bg-amber-950/40">
          <h2 className="mb-2 text-2xl font-bold text-amber-900 dark:text-amber-100">
            Game Over!
          </h2>
          <div className="mb-4 space-y-1">
            {players
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <p key={p.id} className="text-lg text-amber-800 dark:text-amber-200">
                  {i + 1}. {p.name}: <strong>${p.score}</strong>
                </p>
              ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setPlayKey((k) => k + 1);
                setAnswered({});
                setPlayers((p) => p.map((pl) => ({ ...pl, score: 0 })));
              }}
            >
              Play again
            </Button>
            <Link href="/games/jeopardy">
              <Button variant="outline">Choose another deck</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
