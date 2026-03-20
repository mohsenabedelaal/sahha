import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Sahha's food recognition AI. Analyze the food photo and return ONLY valid JSON (no markdown, no explanation) in this exact format:

{
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "estimated_grams": 150,
      "confidence": 0.92,
      "calories": 248,
      "protein_g": 46,
      "carbs_g": 0,
      "fat_g": 5.4,
      "fiber_g": 0
    }
  ],
  "meal_type_guess": "lunch",
  "total_calories": 248
}

Rules:
- Identify EVERY distinct food item visible
- Estimate portion sizes in grams based on visual cues
- Provide nutrition per item based on standard USDA values
- confidence is 0-1, how sure you are about the identification
- If you can't identify a food, set confidence below 0.5
- Always return valid JSON, nothing else`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body as {
      imageBase64: string;
      mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "imageBase64 and mimeType required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "What foods are in this image? Return the JSON.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown code fences
    const jsonText = text.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Photo recognition error:", err);
    return NextResponse.json({ error: "Photo recognition failed" }, { status: 500 });
  }
}
