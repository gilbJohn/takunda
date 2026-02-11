"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Card } from "@/types/deck";
import { Plus, Trash2 } from "lucide-react";

export interface CardEditorProps {
  cards: Card[];
  onChange: (cards: Card[]) => void;
}

export function CardEditor({ cards, onChange }: CardEditorProps) {
  const addCard = () => {
    onChange([
      ...cards,
      { id: `card-${Date.now()}`, front: "", back: "" },
    ]);
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCard = (index: number) => {
    onChange(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Cards</h3>
        <Button type="button" variant="outline" size="sm" onClick={addCard}>
          <Plus className="mr-2 h-4 w-4" />
          Add card
        </Button>
      </div>
      <div className="space-y-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="flex justify-between gap-2">
              <span className="text-sm font-medium text-gray-500">
                Card {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCard(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Front (question)"
                value={card.front}
                onChange={(e) => updateCard(index, "front", e.target.value)}
              />
              <Input
                placeholder="Back (answer)"
                value={card.back}
                onChange={(e) => updateCard(index, "back", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
