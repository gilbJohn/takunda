import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const FLASHCARD_PROMPT = `You are a study assistant. Analyze this document and generate flashcard pairs for effective studying.
Extract key concepts, definitions, and facts. Create question-answer pairs that test understanding.

Return ONLY valid JSON: an array of objects with "front" (question) and "back" (answer).
Example: [{"front":"What is X?","back":"X is..."}]
Generate between 5 and 30 cards depending on document length. Keep fronts concise; backs informative.
Do not include any text outside the JSON array.`;

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("rate limit")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries && isRateLimitError(err)) {
        const waitMs = (attempt + 1) * 15 * 1000; // 15s, 30s
        await sleep(waitMs);
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

const TEXT_PROMPT = `You are a study assistant. Analyze the following text and generate flashcard pairs for effective studying.
Extract key concepts, definitions, and facts. Create question-answer pairs that test understanding.

Return ONLY valid JSON: an array of objects with "front" (question) and "back" (answer).
Example: [{"front":"What is X?","back":"X is..."}]
Generate between 5 and 30 cards depending on the content length. Keep fronts concise; backs informative.
Do not include any text outside the JSON array.`;

function parseAndValidateCards(
  parsed: unknown
): { id: string; front: string; back: string }[] {
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .filter(
      (item): item is { front?: string; back?: string } =>
        item != null && typeof item === "object"
    )
    .map((item, i) => ({
      id: `card-${Date.now()}-${i}`,
      front: String(item.front ?? "").trim() || "Question",
      back: String(item.back ?? "").trim() || "Answer",
    }))
    .filter((c) => c.front && c.back);
}

export async function POST(request: NextRequest) {
  let tempPath: string | null = null;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let textInput: string | null = null;
    let file: File | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      textInput = typeof body.text === "string" ? body.text.trim() : null;
    } else {
      const formData = await request.formData();
      const textField = formData.get("text");
      textInput = typeof textField === "string" ? textField.trim() : null;
      const fileField = formData.get("file");
      if (fileField instanceof File && fileField.size > 0) {
        file = fileField;
      }
    }

    const ai = new GoogleGenAI({ apiKey });
    let responseText: string;
    let suggestedTitle: string;

    if (textInput && textInput.length > 0) {
      // Plain text path: 1 API call only (avoids rate limit from file upload)
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: createUserContent([`${TEXT_PROMPT}\n\n---\n\n${textInput}`]),
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        })
      );
      responseText = response.text ?? "";
      suggestedTitle = "";
    } else if (file) {
      // File path: 2 API calls (upload + generateContent)
      const mimeType = getMimeType(file.name);
      if (!ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number])) {
        return NextResponse.json(
          {
            error: "Invalid file type. Please upload a PDF, DOCX, or PPTX file.",
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "File too large. Maximum size is 20MB. Try a smaller document.",
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".bin";
      const uploadPath = path.join(tmpdir(), `upload-${Date.now()}${ext}`);
      tempPath = uploadPath;
      await writeFile(uploadPath, buffer);

      const uploadedFile = await withRetry(() =>
        ai.files.upload({
          file: uploadPath,
          config: { mimeType },
        })
      );

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: createUserContent([
            createPartFromUri(uploadedFile.uri!, uploadedFile.mimeType ?? mimeType),
            FLASHCARD_PROMPT,
          ]),
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        })
      );
      responseText = response.text ?? "";
      suggestedTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    } else {
      return NextResponse.json(
        {
          error:
            "Provide either plain text or a file (PDF, DOCX, PPTX). Plain text uses fewer API calls.",
        },
        { status: 400 }
      );
    }

    if (!responseText || !responseText.trim()) {
      return NextResponse.json({ error: "Could not extract content." }, { status: 422 });
    }

    let parsed: unknown;
    try {
      const jsonStr = responseText.trim().replace(/^```json\s*|\s*```$/g, "");
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Could not parse flashcards from the response." },
        { status: 422 }
      );
    }

    const cards = parseAndValidateCards(parsed);

    if (cards.length === 0) {
      return NextResponse.json(
        { error: "Could not extract any flashcards." },
        { status: 422 }
      );
    }

    return NextResponse.json({ cards, suggestedTitle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      message.includes("429") || message.includes("RESOURCE_EXHAUSTED") ? 429 : 500;
    return NextResponse.json(
      {
        error:
          status === 429
            ? "Gemini API rate limit reached. The free tier allows ~10–15 requests per minute. Wait 60 seconds, then try again."
            : `Upload failed: ${message}`,
      },
      { status }
    );
  } finally {
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
