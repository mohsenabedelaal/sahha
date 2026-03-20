import Anthropic from "@anthropic-ai/sdk";
import type { FoodRecognitionResult, FoodExplanation } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function recognizeFood(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<FoodRecognitionResult[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64Image },
          },
          {
            type: "text",
            text: `Identify ALL foods in this image. For each food, estimate its nutritional content per visible serving.

Return ONLY valid JSON — no markdown, no explanation:
[
  {
    "name": "food name",
    "confidence": 0.0-1.0,
    "nutrition": {
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number,
      "serving_size": "estimated weight/portion"
    }
  }
]`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return JSON.parse(jsonMatch[0]) as FoodRecognitionResult[];
}

export async function explainFood(
  foodName: string,
  nutritionContext: string,
  userGoal?: string
): Promise<FoodExplanation> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You're a concise nutrition coach. The user just logged "${foodName}". Their nutrition context: ${nutritionContext}. ${userGoal ? `Their goal: ${userGoal}.` : ""}

Write 2-3 sentences explaining why this food is beneficial (or what to watch out for) in relation to their goals. Be specific about nutrients. Keep it encouraging and educational.`,
      },
    ],
  });

  const explanation =
    response.content[0].type === "text" ? response.content[0].text : "";
  return { explanation, food_name: foodName };
}
