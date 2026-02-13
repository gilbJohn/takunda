"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { LobbyView } from "./LobbyView";
import { GameView } from "./GameView";
import { ResultsView } from "./ResultsView";
import type { Player, Question, LastOneStandingProps, GameConfig } from "./types";

const DEFAULT_CONFIG: GameConfig = {
  timerPerQuestion: 15,
  eliminationRate: 1,
  minPlayers: 2,
  maxQuestions: 0,
};

/** Minimum seconds per question (floor as rounds speed up) */
const MIN_TIMER = 5;

/** Seconds to subtract per round (time speeds up as game progresses) */
const TIMER_REDUCTION_PER_ROUND = 1;

/** Get timer duration for a given round index (decreases each round) */
function getTimerForRound(baseSeconds: number, roundIndex: number): number {
  return Math.max(MIN_TIMER, baseSeconds - roundIndex * TIMER_REDUCTION_PER_ROUND);
}

/** Fallback questions when externalQuestions is empty (MVP demo) */
const FALLBACK_QUESTIONS: Question[] = [
  { id: "f1", text: "What is 2 + 2?", correctAnswer: "4", choices: ["3", "4", "5", "6"] },
  {
    id: "f2",
    text: "What is the capital of France?",
    correctAnswer: "Paris",
    choices: ["London", "Paris", "Berlin", "Madrid"],
  },
  {
    id: "f3",
    text: "What planet is known as the Red Planet?",
    correctAnswer: "Mars",
    choices: ["Venus", "Mars", "Jupiter", "Saturn"],
  },
  {
    id: "f4",
    text: "How many continents are there?",
    correctAnswer: "7",
    choices: ["5", "6", "7", "8"],
  },
  {
    id: "f5",
    text: "What is H2O?",
    correctAnswer: "Water",
    choices: ["Salt", "Water", "Sugar", "Oil"],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function LastOneStanding({
  externalQuestions = [],
  onGameEnd,
  config: configProp = {},
  title = "Last One Standing",
}: LastOneStandingProps) {
  const config: GameConfig = { ...DEFAULT_CONFIG, ...configProp };

  const [phase, setPhase] = useState<"lobby" | "playing" | "results">("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [eliminatedThisRound, setEliminatedThisRound] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(config.timerPerQuestion);
  const [roundEnded, setRoundEnded] = useState(false);
  /** Index of the player whose turn it is to answer (one answer per question, then advance) */
  const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);

  // Primary: externalQuestions. Fallback: FALLBACK_QUESTIONS
  const allQuestions = useMemo(() => {
    const source = externalQuestions.length > 0 ? externalQuestions : FALLBACK_QUESTIONS;
    const shuffled = shuffle(source);
    const max =
      config.maxQuestions && config.maxQuestions > 0
        ? config.maxQuestions
        : shuffled.length;
    return shuffled.slice(0, max);
  }, [externalQuestions, config.maxQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  const alivePlayers = players.filter((p) => p.isAlive);

  // HOOK: Replace with Supabase Realtime or WebSocket for multiplayer sync
  // e.g. const { data } = supabase.channel(`game-${gameId}`).on('broadcast', { event: 'player-answer' }, payload => ...)
  // or: useWebSocket(`/games/${gameId}`) and broadcast answers for real-time nextPlayers
  const nextPlayers = players;

  const addPlayer = useCallback((name: string) => {
    setPlayers((p) => [...p, { id: `p-${Date.now()}`, name, isAlive: true }]);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((p) => p.filter((x) => x.id !== id));
  }, []);

  const startGame = useCallback(() => {
    if (players.length < (config.minPlayers ?? 2)) return;
    if (allQuestions.length === 0) return;
    setQuestions(shuffle([...allQuestions]));
    setPhase("playing");
    setCurrentQuestionIndex(0);
    setEliminatedThisRound([]);
    setTimeRemaining(getTimerForRound(config.timerPerQuestion, 0));
    setRoundEnded(false);
    setCurrentRespondentIndex(0);
    setPlayers((p) => p.map((pl) => ({ ...pl, isAlive: true })));
  }, [players.length, allQuestions, config.minPlayers, config.timerPerQuestion]);

  const eliminatePlayer = useCallback((playerId: string) => {
    setPlayers((p) =>
      p.map((pl) => (pl.id === playerId ? { ...pl, isAlive: false } : pl))
    );
    setEliminatedThisRound((e) => (e.includes(playerId) ? e : [...e, playerId]));
  }, []);

  const processAnswer = useCallback(
    (playerId: string, choice: string, correct: boolean) => {
      if (correct) return;
      const rate = config.eliminationRate ?? 1;
      if (rate >= 1) {
        eliminatePlayer(playerId);
      }
      // TODO: If rate < 1, eliminate bottom X% of wrong answers
    },
    [config.eliminationRate, eliminatePlayer]
  );

  // Current respondent: whose turn to answer (round-robin among alive players)
  const currentRespondent = useMemo(() => {
    const alive = players.filter((p) => p.isAlive);
    if (alive.length === 0) return null;
    // Start from currentRespondentIndex, wrap to find next alive
    for (let i = 0; i < players.length; i++) {
      const idx = (currentRespondentIndex + i) % players.length;
      const p = players[idx];
      if (p?.isAlive) return p;
    }
    return alive[0] ?? null;
  }, [players, currentRespondentIndex]);

  // One answer per question – immediately end round and advance to next
  const handleAnswer = useCallback(
    (choice: string) => {
      if (!currentQuestion || roundEnded || !currentRespondent) return;
      const correct = choice === currentQuestion.correctAnswer;
      processAnswer(currentRespondent.id, choice, correct);
      setRoundEnded(true);
    },
    [currentQuestion, roundEnded, currentRespondent, processAnswer]
  );

  const advanceRound = useCallback(() => {
    setEliminatedThisRound([]);
    setRoundEnded(false);
    const nextRoundIndex = currentQuestionIndex + 1;
    setTimeRemaining(getTimerForRound(config.timerPerQuestion, nextRoundIndex));

    const stillAlive = players.filter((p) => p.isAlive);
    if (stillAlive.length <= 1) {
      setPhase("results");
      const winner = stillAlive[0] ?? null;
      onGameEnd?.(winner);
      return;
    }

    if (currentQuestionIndex + 1 >= questions.length) {
      setPhase("results");
      const winner = stillAlive[0] ?? null;
      onGameEnd?.(winner);
      return;
    }

    setCurrentQuestionIndex((i) => i + 1);
    // Next alive player's turn (round-robin)
    const nextAlive = players.map((p, idx) => ({ p, idx })).filter(({ p }) => p.isAlive);
    const currentIdx = nextAlive.findIndex(({ p }) => p.id === currentRespondent?.id);
    const next = nextAlive[(currentIdx + 1) % nextAlive.length];
    setCurrentRespondentIndex(next?.idx ?? 0);
  }, [
    config.timerPerQuestion,
    players,
    currentQuestionIndex,
    questions.length,
    onGameEnd,
    currentRespondent,
  ]);

  // Timer: if current player doesn't answer in time, they're eliminated
  useEffect(() => {
    if (phase !== "playing" || roundEnded || !currentQuestion || !currentRespondent)
      return;

    const tick = () => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          eliminatePlayer(currentRespondent.id);
          setRoundEnded(true);
          return 0;
        }
        return t - 1;
      });
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, roundEnded, currentQuestion, currentRespondent, eliminatePlayer]);

  // When round ends, advance to next question after brief delay
  useEffect(() => {
    if (!roundEnded || phase !== "playing") return;
    const id = setTimeout(advanceRound, 1800);
    return () => clearTimeout(id);
  }, [roundEnded, phase, advanceRound]);

  const handlePlayAgain = useCallback(() => {
    setPhase("lobby");
    setCurrentQuestionIndex(0);
    setPlayers((p) => p.map((pl) => ({ ...pl, isAlive: true })));
  }, []);

  if (phase === "lobby") {
    return (
      <LobbyView
        players={players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onStartGame={startGame}
        minPlayers={config.minPlayers}
        title={title}
      />
    );
  }

  if (phase === "results") {
    const winner = players.find((p) => p.isAlive) ?? null;
    return <ResultsView winner={winner} onPlayAgain={handlePlayAgain} title={title} />;
  }

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center text-gray-500">
        No questions available. Add questions via externalQuestions prop.
      </div>
    );
  }

  return (
    <GameView
      key={currentQuestion.id}
      question={currentQuestion}
      players={nextPlayers}
      eliminatedThisRound={eliminatedThisRound}
      timeRemaining={timeRemaining}
      timerTotal={getTimerForRound(config.timerPerQuestion, currentQuestionIndex)}
      onAnswer={handleAnswer}
      roundEnded={roundEnded}
      correctAnswer={currentQuestion.correctAnswer}
      currentRespondent={currentRespondent}
    />
  );
}
