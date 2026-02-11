import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Deck } from "@/types/deck";

export interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  const cardCount = deck.cards.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{deck.title}</CardTitle>
        <CardDescription>
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/study/${deck.id}/learn`}>
          <Button>Study</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
