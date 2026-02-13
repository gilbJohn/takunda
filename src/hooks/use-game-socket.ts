"use client";

import { useEffect, useCallback, useState } from "react";

/**
 * Placeholder hook for real-time game sync.
 * Swap this for Supabase Realtime, Socket.io, or Ably when ready.
 *
 * Usage:
 *   const { roomId, phase, players, emit } = useGameSocket(roomId);
 *   emit("START_GAME");
 *   emit("SUBMIT_EXPLANATION", { explanation });
 */
export interface GameSocketState {
  roomId: string;
  phase: string;
  players: { id: string; name: string }[];
  isConnected: boolean;
}

export type GameEvent =
  | { action: "START_GAME" }
  | { action: "PLAYER_JOINED"; name: string; id?: string }
  | { action: "SUBMIT_EXPLANATION"; explanation: string }
  | { action: "VOTE"; submissionId: string }
  | { action: "ALL_VOTED" };

export function useGameSocket(roomId: string) {
  const [state, setState] = useState<GameSocketState>({
    roomId,
    phase: "lobby",
    players: [],
    isConnected: false,
  });

  const emit = useCallback((event: GameEvent) => {
    // Placeholder: In production, send to server
    // e.g. socket.emit("game_event", { roomId, ...event });
    console.log(`[useGameSocket] emit:`, event);
    if (event.action === "START_GAME") {
      setState((s) => ({ ...s, phase: "explain" }));
    }
  }, []);

  useEffect(() => {
    // Placeholder: Connect to room
    // e.g. const channel = supabase.channel(`game-${roomId}`)
    //      channel.on('broadcast', { event: '...' }, handleMessage)
    console.log(`[useGameSocket] Connected to room: ${roomId}`);
    setState((s) => ({ ...s, isConnected: true }));
    return () => console.log(`[useGameSocket] Disconnected`);
  }, [roomId]);

  return {
    ...state,
    emit,
    setState,
  };
}
