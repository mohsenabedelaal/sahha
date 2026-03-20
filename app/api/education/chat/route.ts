import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatMessages, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();
  const { message } = body as { message: string };

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  // Get user context
  const [user] = await db
    .select({
      name: users.name,
      goal_type: users.goal_type,
      diet_preference: users.diet_preference,
      daily_calorie_target: users.daily_calorie_target,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Get recent chat history (last 10 messages)
  const history = await db
    .select({ role: chatMessages.role, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.user_id, userId))
    .orderBy(desc(chatMessages.created_at))
    .limit(10);

  // Save user message
  await db.insert(chatMessages).values({
    user_id: userId,
    role: "user",
    content: message,
  });

  // Build conversation
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...history.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  const systemPrompt = `You are Sahha, a friendly and knowledgeable nutrition coach AI. You help users understand nutrition, make healthy food choices, and achieve their health goals.

User context:
- Name: ${user?.name || "User"}
- Goal: ${user?.goal_type || "Not set"}
- Diet: ${user?.diet_preference || "Standard"}
- Daily calorie target: ${user?.daily_calorie_target || "Not set"}

Keep responses concise (2-4 sentences usually). Be encouraging and evidence-based. If asked about medical conditions, advise consulting a healthcare professional.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages,
  });

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Save assistant message
  await db.insert(chatMessages).values({
    user_id: userId,
    role: "assistant",
    content: assistantMessage,
  });

  return NextResponse.json({ message: assistantMessage });
}
