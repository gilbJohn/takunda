"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardEditor } from "./card-editor";
import { useStudyStore } from "@/stores/study-store";
import type { Deck, Card } from "@/types/deck";

export function DeckCreationForm() {
  const router = useRouter();
  const addDeck = useStudyStore((s) => s.addDeck);
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Card[]>([
    { id: "card-1", front: "", back: "" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (!title.trim() || validCards.length === 0) return;

    const deck: Omit<Deck, "id"> = {
      title: title.trim(),
      cards: validCards,
    };
    await addDeck(deck);
    router.push("/study");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Deck title
        </label>
        <Input
          id="title"
          placeholder="e.g. Biology - Cell Structure"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <CardEditor cards={cards} onChange={setCards} />
      <div className="flex gap-4">
        <Button type="submit">Create deck</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/study")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
