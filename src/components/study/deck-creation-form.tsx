"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardEditor } from "./card-editor";
import { useStudyStore } from "@/stores/study-store";
import type { Deck, Card } from "@/types/deck";
import { FileUp, Type } from "lucide-react";

export function DeckCreationForm() {
  const router = useRouter();
  const addDeck = useStudyStore((s) => s.addDeck);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardEditorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Card[]>([
    { id: "card-1", front: "", back: "" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importText, setImportText] = useState("");

  const applyGeneratedCards = (data: { cards: { front: string; back: string }[]; suggestedTitle?: string }) => {
    if (data.cards?.length) {
      const newCards: Card[] = data.cards.map((c, i) => ({
        id: `card-${Date.now()}-${i}`,
        front: c.front ?? "",
        back: c.back ?? "",
      }));
      setCards(newCards);
      if (data.suggestedTitle && !title.trim()) {
        setTitle(data.suggestedTitle);
      }
      cardEditorRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setImportError("Could not extract flashcards.");
    }
  };

  const handleImportFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      applyGeneratedCards(data);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Upload failed. Try a smaller file or different format.");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  /** Parse text locally into cards - no API, no rate limits */
  const parseTextToCards = (text: string): { front: string; back: string }[] => {
    const cards: { front: string; back: string }[] = [];

    // Split by "Term: Definition" or "Term - Definition" (common in study notes)
    const termDef = text.split(/\n+/).filter((l) => l.trim().length > 0);
    for (const line of termDef) {
      const colon = line.match(/^(.+?)\s*[:\-–—]\s*(.+)$/);
      if (colon) {
        const front = colon[1].trim();
        const back = colon[2].trim();
        if (front.length > 0 && back.length > 0) {
          cards.push({ front, back });
          continue;
        }
      }
      // Bullet points: each line = one card (front = line, back = same for memorization)
      if (/^[\-\*•]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line)) {
        const content = line.replace(/^[\-\*•]\s+/, "").replace(/^\d+[\.\)]\s+/, "").trim();
        if (content.length > 10) {
          const short = content.length > 80 ? content.slice(0, 77) + "..." : content;
          cards.push({ front: short, back: content });
          continue;
        }
      }
    }

    // If we got term/def pairs, return those
    if (cards.length > 0) return cards;

    // Fallback: split by double newline (paragraphs). Each para = one card.
    const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 15);
    for (const p of paras) {
      const front = p.length > 100 ? p.slice(0, 97) + "..." : p;
      cards.push({ front, back: p });
    }

    return cards;
  };

  const handleImportFromText = () => {
    const text = importText.trim();
    if (!text) {
      setImportError("Paste some text first.");
      return;
    }
    setImportError(null);
    const cards = parseTextToCards(text);
    if (cards.length === 0) {
      setImportError("Could not split text into cards. Try adding 'Term: Definition' pairs or bullet points.");
      return;
    }
    applyGeneratedCards({ cards });
  };

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

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Import to generate flashcards
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paste text (instant, no API) or upload a file (uses AI). For text, use &quot;Term: Definition&quot; or bullet points for best results.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Type className="h-4 w-4" />
              Paste text
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use &quot;Term: Definition&quot; per line, bullet points, or paragraphs separated by blank lines.
            </p>
            <textarea
              placeholder={'e.g.\nPhotosynthesis: Plants convert light into energy\nMitochondria: The powerhouse of the cell'}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleImportFromText}
              disabled={!importText.trim()}
            >
              Generate from text
            </Button>
          </div>
          <div className="space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileUp className="h-4 w-4" />
              Upload file
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={handleImportFromFile}
              disabled={isImporting}
              className="hidden"
              aria-hidden
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              aria-label="Upload PDF, DOCX, or PPTX to generate flashcards"
              className="w-full justify-center"
            >
              {isImporting ? "Generating…" : "Choose PDF, DOCX, or PPTX"}
            </Button>
          </div>
        </div>
        {importError && (
          <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
        )}
      </div>

      <div ref={cardEditorRef}>
        <CardEditor cards={cards} onChange={setCards} />
      </div>
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
