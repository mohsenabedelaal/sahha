import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Sahha's nutrition parsing AI. The user will describe food they ate in natural language. Return ONLY valid JSON (no markdown, no explanation) in this exact format:

{
  "foods": [
    {
      "name": "Scrambled Eggs",
      "estimated_grams": 150,
      "confidence": 0.95,
      "calories": 220,
      "protein_g": 15,
      "carbs_g": 2,
      "fat_g": 16,
      "fiber_g": 0
    }
  ],
  "meal_type_guess": "breakfast",
  "total_calories": 220
}

Rules:
- Parse EVERY food item mentioned
- Estimate quantities from context (e.g. "2 eggs" = ~100g)
- Use standard USDA nutrition values
- confidence is 0-1
- Always return valid JSON, nothing else`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body as { text: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `I ate: ${text}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonText = raw.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (err) {
    console.error("NLP parse error:", err);
    return NextResponse.json({ error: "Text parsing failed" }, { status: 500 });
  }
}
