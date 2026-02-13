/**
 * Last One Standing - Battle Royale Quiz
 * Type definitions for the game module.
 */

export interface Player {
  id: string;
  name: string;
  /** Whether the player is still in the game (not eliminated) */
  isAlive: boolean;
  /** Optional: score/streak for display */
  score?: number;
}

export interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  /** Optional choices for multiple choice (if not provided, free-response style) */
  choices?: string[];
}

export interface GameConfig {
  /** Seconds per question before auto-advance */
  timerPerQuestion: number;
  /** Fraction of wrong-answer players to eliminate each round (0-1). 1 = all wrong eliminated. */
  eliminationRate: number;
  /** Minimum players to start */
  minPlayers?: number;
  /** Maximum questions (0 = use all provided) */
  maxQuestions?: number;
}

export interface LastOneStandingProps {
  /** Primary question source. Takes precedence over fallback. */
  externalQuestions?: Question[];
  /** Callback when game ends with winner data */
  onGameEnd?: (winner: Player | null) => void;
  /** Game settings */
  config?: Partial<GameConfig>;
  /** Optional title for the game */
  title?: string;
}

export type GamePhase = "lobby" | "playing" | "results";

export interface GameState {
  phase: GamePhase;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  /** Players who answered wrong this round (for elimination animation) */
  eliminatedThisRound: string[];
  /** Time remaining in current question (seconds) */
  timeRemaining: number;
}
