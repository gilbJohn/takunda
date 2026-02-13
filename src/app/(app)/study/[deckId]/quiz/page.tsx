"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { useDeck } from "@/hooks/use-deck";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const MIN_CARDS = 4;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type QuizQuestion = {
  cardId: string;
  question: string;
  correctAnswer: string;
  choices: string[];
};

function buildQuestions(
  cards: { id: string; front: string; back: string }[],
  choiceCount: 2 | 4
): QuizQuestion[] {
  const shuffled = shuffle(cards);
  return shuffled.map((card) => {
    const others = cards.filter((c) => c.id !== card.id);
    const wrongAnswers = shuffle(others)
      .slice(0, choiceCount - 1)
      .map((c) => c.back);
    const choices = shuffle([card.back, ...wrongAnswers]);
    return {
      cardId: card.id,
      question: card.front,
      correctAnswer: card.back,
      choices,
    };
  });
}

export default function QuizPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { deck, loading } = useDeck(deckId);

  const [mode, setMode] = useState<"easy" | "hard" | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const questions = useMemo(() => {
    if (!deck || !mode) return [];
    return buildQuestions(deck.cards, mode === "easy" ? 2 : 4);
  }, [deck, mode]);

  const currentQuestion = questions[questionIndex];
  const isComplete = mode && questions.length > 0 && questionIndex >= questions.length;

  if (loading) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader title="Deck not found" description="This deck could not be found." />
        <Link href="/study">
          <Button variant="outline">Back to Study</Button>
        </Link>
      </div>
    );
  }

  const cardCount = deck.cards.length;

  if (cardCount < MIN_CARDS) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader
          title={`Quiz: ${deck.title}`}
          description={`You need at least ${MIN_CARDS} cards to take a quiz. This deck has ${cardCount}.`}
        />
        <div className="flex gap-4">
          <Link href="/study">
            <Button variant="outline">Back to decks</Button>
          </Link>
          <Link href={`/study/${deckId}/learn`}>
            <Button>Study cards</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mode selection
  if (!mode) {
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader
          title={`Quiz: ${deck.title}`}
          description="Choose a difficulty. Easy has 2 choices per question, hard has 4."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer transition-colors hover:border-gray-400 dark:hover:border-gray-600"
            onClick={() => setMode("easy")}
          >
            <CardHeader>
              <CardTitle>Easy</CardTitle>
              <CardDescription>2 answer choices per question</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-colors hover:border-gray-400 dark:hover:border-gray-600"
            onClick={() => setMode("hard")}
          >
            <CardHeader>
              <CardTitle>Hard</CardTitle>
              <CardDescription>4 answer choices per question</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Link href="/study">
          <Button variant="outline">Back to decks</Button>
        </Link>
      </div>
    );
  }

  // Results screen
  if (isComplete) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="container max-w-2xl space-y-8 p-8">
        <PageHeader
          title="Quiz complete!"
          description={`You got ${score} of ${questions.length} correct (${pct}%)`}
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg font-medium">
              {pct === 100
                ? "Perfect score!"
                : pct >= 80
                  ? "Great job!"
                  : pct >= 60
                    ? "Good effort!"
                    : "Keep studying!"}
            </p>
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              setMode(null);
              setQuestionIndex(0);
              setScore(0);
            }}
          >
            Try again
          </Button>
          <Link href="/study">
            <Button variant="outline">Back to decks</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const handleAnswer = (choice: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(choice);
    if (choice === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setQuestionIndex((i) => i + 1);
  };

  const gotCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  return (
    <div className="container max-w-2xl space-y-8 p-8">
      <PageHeader
        title={`Quiz: ${deck.title}`}
        description={`Question ${questionIndex + 1} of ${questions.length} (${mode === "easy" ? "Easy" : "Hard"})`}
      />

      {/* Immediate feedback banner */}
      {selectedAnswer && (
        <div
          className={cn(
            "flex items-center gap-4 rounded-xl px-6 py-4 animate-success-pop",
            gotCorrect
              ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400"
              : "bg-red-500/20 border-2 border-red-500 text-red-700 dark:text-red-400 dark:border-red-400"
          )}
        >
          {gotCorrect ? (
            <>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-7 w-7" strokeWidth={3} />
              </div>
              <div>
                <p className="font-bold text-lg">Correct!</p>
                <p className="text-sm opacity-90">Nice work.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                <X className="h-7 w-7" strokeWidth={3} />
              </div>
              <div>
                <p className="font-bold text-lg">Incorrect</p>
                <p className="text-sm opacity-90">
                  The correct answer is highlighted below.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <Card
        className={cn(
          selectedAnswer &&
            gotCorrect &&
            "animate-success-flash ring-2 ring-emerald-500/50"
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion?.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion?.choices.map((choice) => {
            const isCorrect = choice === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === choice;
            const showResult = selectedAnswer !== null;

            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleAnswer(choice)}
                disabled={!!selectedAnswer}
                className={cn(
                  "flex w-full min-h-12 items-center justify-between gap-4 rounded-lg border-2 px-4 py-3 text-left transition-all",
                  "disabled:cursor-default disabled:pointer-events-none",
                  !showResult &&
                    "border-gray-200 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900/50",
                  showResult &&
                    isCorrect &&
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400 animate-correct-glow",
                  showResult &&
                    isSelected &&
                    !isCorrect &&
                    "border-red-500 bg-red-50 dark:bg-red-950/40 dark:border-red-400 animate-wrong-shake",
                  showResult &&
                    !isSelected &&
                    !isCorrect &&
                    "border-gray-200 opacity-60 dark:border-gray-800"
                )}
              >
                <span className="flex-1 font-medium">{choice}</span>
                {showResult && isSelected && (
                  <span className="shrink-0">
                    {isCorrect ? (
                      <Check
                        className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={3}
                      />
                    ) : (
                      <X
                        className="h-6 w-6 text-red-600 dark:text-red-400"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                )}
                {showResult && isCorrect && !isSelected && (
                  <Check
                    className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>
      {selectedAnswer && (
        <div className="flex justify-between">
          <Link href="/study">
            <Button variant="ghost">Quit</Button>
          </Link>
          <Button onClick={handleNext} size="lg">
            {questionIndex + 1 < questions.length ? "Next" : "See results"}
          </Button>
        </div>
      )}
    </div>
  );
}
