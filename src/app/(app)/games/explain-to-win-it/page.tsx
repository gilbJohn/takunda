"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ExplainToWin } from "@/components/games/explain-to-win-it";

export default function ExplainToWinItPage() {
  // Room ID for multiplayer - can be from URL params when you add Supabase/Socket.io
  const [roomId] = useState(
    () => "EXPLAIN-" + Math.random().toString(36).slice(2, 8).toUpperCase()
  );

  return (
    <div className="container max-w-2xl space-y-6 p-6">
      <PageHeader
        title="Explain It To Win It"
        description="Type explanations, vote for the best, reveal the winner!"
      />
      <ExplainToWin
        roomId={roomId}
        timerDuration={20}
        onGameEnd={(result) => console.log("Game ended:", result)}
      />
      <div className="flex justify-center">
        <Link href="/games">
          <Button variant="ghost">Back to Games</Button>
        </Link>
      </div>
    </div>
  );
}
