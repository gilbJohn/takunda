/**
 * Explain It To Win It - Creative multiplayer explanation game
 * Type definitions for the game module.
 */

export interface Player {
  id: string;
  name: string;
  isHost?: boolean;
}

export interface Term {
  id: string;
  term: string;
  category: string;
}

export type GamePhase = "lobby" | "explain" | "vote" | "results";

export interface Submission {
  id: string;
  explanation: string;
  authorId: string; // Only revealed in results phase
}

export interface GameResult {
  winner: Player | null;
  winningExplanation: string;
  roundsPlayed: number;
}

export interface ExplainToWinProps {
  /** Terms to explain - can be strings or full Term objects */
  terms?: (string | Term)[];
  /** Timer duration in seconds for the explanation phase */
  timerDuration?: number;
  /** Callback when game ends with game data/winner */
  onGameEnd?: (result: GameResult) => void;
  /** Optional room ID for multiplayer (from URL, etc.) */
  roomId?: string;
}
