import { NextResponse } from "next/server";
import { getDeck } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: { deckId: string } }) {
  const deck = await getDeck(params.deckId);
  if (!deck) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deck);
}
