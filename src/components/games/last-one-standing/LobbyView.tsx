"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Player } from "./types";

interface LobbyViewProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: () => void;
  minPlayers?: number;
  title?: string;
}

export function LobbyView({
  players,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  minPlayers = 2,
  title = "Last One Standing",
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
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Add players to start. Last player standing wins!
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Player name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} type="button">
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
              onClick={() => onRemovePlayer(p.id)}
              className="h-8 w-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        onClick={onStartGame}
        disabled={players.length < minPlayers}
        className="w-full"
      >
        Start game
      </Button>
      {players.length > 0 && players.length < minPlayers && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          Add at least {minPlayers} players to start.
        </p>
      )}
    </div>
  );
}
