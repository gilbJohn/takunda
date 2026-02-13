"use client";

import { useState } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Player } from "./types";

interface LobbyViewProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: () => void;
  minPlayers?: number;
}

export function LobbyView({
  players,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  minPlayers = 2,
}: LobbyViewProps) {
  const [nameInput, setNameInput] = useState("");

  const handleAdd = () => {
    const name = nameInput.trim();
    if (name) {
      onAddPlayer(name);
      setNameInput("");
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 space-y-6 shadow-lg border-2">
      <header className="space-y-2 text-center border-b pb-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-fit mx-auto">
          <Users className="h-8 w-8 text-gray-900 dark:text-gray-100" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Explain It To Win It</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          One screen - pass the computer around. Everyone types, then votes anonymously.
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Player name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} type="button">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Players ({players.length})
        </h3>
        <div className="space-y-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900/50"
            >
              <span className="font-medium">{p.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemovePlayer(p.id)}
                className="h-8 w-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={onStartGame}
        disabled={players.length < minPlayers}
        className="w-full"
        size="lg"
      >
        Start Game
      </Button>
      {players.length > 0 && players.length < minPlayers && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          Add at least {minPlayers} players to start.
        </p>
      )}
    </Card>
  );
}
