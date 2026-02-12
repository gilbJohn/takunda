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

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
    if (!title.trim()) {
      setError("Please enter a deck title.");
      return;
    }
    if (validCards.length === 0) {
      setError("Please add at least one card with both front and back filled.");
      return;
    }

    setIsSubmitting(true);
    try {
      const deck: Omit<Deck, "id"> = {
        title: title.trim(),
        cards: validCards,
      };
      await addDeck(deck);
      router.push("/study");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck");
    } finally {
      setIsSubmitting(false);
    }
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
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create deck"}
        </Button>
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
