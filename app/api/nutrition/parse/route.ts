import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import type { ParsedFood } from "@/lib/api/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Sahha's nutrition parsing AI. Parse food descriptions into structured nutrition data.
Return ONLY a valid JSON array — no markdown, no explanation:

[
  {
    "name": "Scrambled Eggs",
    "quantity": 2,
    "unit": "large",
    "nutrition": {
      "calories": 182,
      "protein_g": 12.6,
      "carbs_g": 1.6,
      "fat_g": 13.8,
      "fiber_g": 0,
      "serving_size": "2 large eggs (100g)"
    }
  }
]

Rules:
- Parse EVERY food item mentioned
- Estimate quantity from context (e.g. "a slice" = 1 slice)
- Use standard USDA nutrition values per stated quantity
- Return valid JSON array only`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { text } = body as { text: string };

  if (!text || text.trim().length < 2) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `I ate: ${text}` }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return NextResponse.json({ foods: [] });

    const foods: ParsedFood[] = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ foods });
  } catch (err) {
    console.error("NLP parse error:", err);
    return NextResponse.json({ error: "Text parsing failed" }, { status: 500 });
  }
}
