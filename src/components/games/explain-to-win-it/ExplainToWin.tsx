"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameSocket } from "@/hooks/use-game-socket";
import { LobbyView } from "./LobbyView";
import { ExplanationPhase } from "./ExplanationPhase";
import { VotingPhase } from "./VotingPhase";
import { ResultsView } from "./ResultsView";
import type {
  ExplainToWinProps,
  GamePhase,
  Player,
  Term,
  Submission,
  GameResult,
} from "./types";

const DEFAULT_TERMS: Term[] = [
  { id: "t1", term: "Photosynthesis", category: "Biology" },
  { id: "t2", term: "Machine Learning", category: "Technology" },
  { id: "t3", term: "Inflation", category: "Economics" },
  { id: "t4", term: "Democracy", category: "Politics" },
  { id: "t5", term: "Black Hole", category: "Astronomy" },
];

function normalizeTerms(input: (string | Term)[]): Term[] {
  return input.map((t, i) =>
    typeof t === "string" ? { id: `term-${i}`, term: t, category: "General" } : t
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ExplainToWin({
  terms = [],
  timerDuration = 20,
  onGameEnd,
  roomId = "ROOM-123",
}: ExplainToWinProps) {
  const termsList = useMemo(
    () => (terms.length > 0 ? normalizeTerms(terms) : DEFAULT_TERMS),
    [terms]
  );

  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameTerms, setGameTerms] = useState<Term[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentExplainPlayerIndex, setCurrentExplainPlayerIndex] = useState(0);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [explanation, setExplanation] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({}); // voterId -> submissionId
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const currentTerm = gameTerms[currentRoundIndex];
  const isLastRound = currentRoundIndex >= gameTerms.length - 1;
  const currentExplainPlayer = players[currentExplainPlayerIndex] ?? null;
  const currentVoter = players[currentVoterIndex] ?? null;

  const { emit } = useGameSocket(roomId);

  const addPlayer = useCallback((name: string) => {
    setPlayers((p) => [...p, { id: `p-${Date.now()}`, name, isHost: p.length === 0 }]);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((p) => p.filter((x) => x.id !== id));
  }, []);

  const startGame = useCallback(() => {
    if (players.length < 2) return;
    setGameTerms(shuffle(termsList));
    setPhase("explain");
    setCurrentRoundIndex(0);
    setCurrentExplainPlayerIndex(0);
    setCurrentVoterIndex(0);
    setTimeLeft(timerDuration);
    setExplanation("");
    setSubmissions([]);
    setVotes({});
    setSelectedSubmissionId(null);
    setPlayers((p) => shuffle(p));
    emit({ action: "START_GAME" });
  }, [players.length, termsList, timerDuration, emit]);

  const handleSubmitExplanation = useCallback(() => {
    if (!currentTerm || !currentExplainPlayer) return;
    const trimmed = explanation.trim() || "(No explanation submitted)";

    const newSub: Submission = {
      id: `sub-${currentExplainPlayer.id}-${Date.now()}`,
      explanation: trimmed,
      authorId: currentExplainPlayer.id,
    };
    setSubmissions((s) => [...s, newSub]);
    setExplanation("");

    if (currentExplainPlayerIndex + 1 >= players.length) {
      setPhase("vote");
      setCurrentVoterIndex(0);
      setSelectedSubmissionId(null);
    } else {
      setCurrentExplainPlayerIndex((i) => i + 1);
      setTimeLeft(timerDuration);
    }
  }, [
    explanation,
    currentTerm,
    currentExplainPlayer,
    currentExplainPlayerIndex,
    players.length,
    timerDuration,
  ]);

  const handleSubmitVote = useCallback(() => {
    if (!currentVoter || !selectedSubmissionId) return;

    setVotes((v) => ({ ...v, [currentVoter.id]: selectedSubmissionId }));

    if (currentVoterIndex + 1 >= players.length) {
      setRoundsPlayed((r) => r + 1);
      setPhase("results");
    } else {
      setCurrentVoterIndex((i) => i + 1);
      setSelectedSubmissionId(null);
    }
  }, [currentVoter, selectedSubmissionId, currentVoterIndex, players.length]);

  const getWinningSubmission = useCallback(() => {
    const tally: Record<string, number> = {};
    Object.values(votes).forEach((subId) => {
      tally[subId] = (tally[subId] ?? 0) + 1;
    });
    const entries = Object.entries(tally);
    if (entries.length === 0) return null;
    const [winnerId] = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
    return submissions.find((s) => s.id === winnerId) ?? null;
  }, [votes, submissions]);

  const handleFinishGame = useCallback(() => {
    const winningSub = getWinningSubmission();
    const winner = winningSub
      ? (players.find((p) => p.id === winningSub.authorId) ?? null)
      : null;
    const result: GameResult = {
      winner,
      winningExplanation: winningSub?.explanation ?? "",
      roundsPlayed,
    };
    onGameEnd?.(result);
    setPhase("lobby");
    setCurrentRoundIndex(0);
    setRoundsPlayed(0);
    setPlayers((p) => p.map((pl) => ({ ...pl, isHost: pl.id === p[0]?.id })));
  }, [getWinningSubmission, players, roundsPlayed, onGameEnd]);

  const handleNextRound = useCallback(() => {
    if (currentRoundIndex + 1 >= gameTerms.length) {
      handleFinishGame();
      return;
    }
    setCurrentRoundIndex((i) => i + 1);
    setCurrentExplainPlayerIndex(0);
    setCurrentVoterIndex(0);
    setPhase("explain");
    setTimeLeft(timerDuration);
    setExplanation("");
    setSubmissions([]);
    setVotes({});
    setSelectedSubmissionId(null);
  }, [currentRoundIndex, gameTerms.length, timerDuration, handleFinishGame]);

  // Timer countdown during explanation phase
  useEffect(() => {
    if (phase !== "explain" || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, timeLeft]);

  // Auto-submit when timer hits zero
  useEffect(() => {
    if (phase !== "explain" || timeLeft !== 0 || !currentExplainPlayer) return;
    handleSubmitExplanation();
  }, [phase, timeLeft, currentExplainPlayer, handleSubmitExplanation]);

  const isLocked = phase === "explain" && timeLeft <= 0;

  // Submissions the current voter can see (exclude their own, random order)
  const votableSubmissions = useMemo(() => {
    if (!currentVoter) return [];
    const filtered = submissions
      .filter((s) => s.authorId !== currentVoter.id)
      .map((s) => ({ id: s.id, explanation: s.explanation }));
    return shuffle(filtered);
  }, [submissions, currentVoter]);

  // Lobby
  if (phase === "lobby") {
    return (
      <LobbyView
        players={players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onStartGame={startGame}
        minPlayers={2}
      />
    );
  }

  // Explanation phase - each player types in turn
  if (phase === "explain" && currentTerm && currentExplainPlayer) {
    return (
      <ExplanationPhase
        term={currentTerm}
        currentPlayerName={currentExplainPlayer.name}
        timeLeft={timeLeft}
        timerTotal={timerDuration}
        explanation={explanation}
        onExplanationChange={setExplanation}
        onSubmit={handleSubmitExplanation}
        isLocked={isLocked}
      />
    );
  }

  // Voting phase - each player votes in turn (can't vote for own)
  if (phase === "vote" && currentTerm && currentVoter) {
    return (
      <VotingPhase
        term={currentTerm.term}
        currentVoterName={currentVoter.name}
        submissions={votableSubmissions}
        selectedId={selectedSubmissionId}
        onSelect={setSelectedSubmissionId}
        onSubmitVote={handleSubmitVote}
      />
    );
  }

  // Results phase
  if (phase === "results") {
    const winningSub = getWinningSubmission();
    const winner = winningSub
      ? (players.find((p) => p.id === winningSub.authorId) ?? null)
      : null;

    return (
      <ResultsView
        winner={winner}
        winningExplanation={winningSub?.explanation ?? ""}
        isLastRound={isLastRound}
        onNextRound={handleNextRound}
        onFinishGame={handleFinishGame}
      />
    );
  }

  return null;
}
