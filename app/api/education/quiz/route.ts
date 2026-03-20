import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizQuestions, userQuizResults } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { awardXp } from "@/lib/gamification-engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const questions = await db.select().from(quizQuestions);
  const answered = await db
    .select({ quiz_question_id: userQuizResults.quiz_question_id })
    .from(userQuizResults)
    .where(eq(userQuizResults.user_id, userId));

  const answeredIds = new Set(answered.map((a) => a.quiz_question_id));

  // Return unanswered questions, shuffled, limit 5
  const unanswered = questions
    .filter((q) => !answeredIds.has(q.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((q) => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options),
      xp_reward: q.xp_reward,
    }));

  return NextResponse.json({ questions: unanswered, total: questions.length, answered: answeredIds.size });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();
  const { answers } = body as { answers: Array<{ questionId: number; selectedIndex: number }> };

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Answers required" }, { status: 400 });
  }

  let correct = 0;
  let totalXp = 0;
  const results: Array<{ questionId: number; correct: boolean; explanation: string; correctIndex: number }> = [];

  for (const answer of answers) {
    const [question] = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, answer.questionId))
      .limit(1);

    if (!question) continue;

    const isCorrect = answer.selectedIndex === question.correct_index;
    if (isCorrect) {
      correct++;
      totalXp += question.xp_reward;
    }

    // Check if already answered
    const [existing] = await db
      .select()
      .from(userQuizResults)
      .where(
        and(
          eq(userQuizResults.user_id, userId),
          eq(userQuizResults.quiz_question_id, question.id)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(userQuizResults).values({
        user_id: userId,
        quiz_question_id: question.id,
        answered_correctly: isCorrect,
      });
    }

    results.push({
      questionId: question.id,
      correct: isCorrect,
      explanation: question.explanation,
      correctIndex: question.correct_index,
    });
  }

  // Award XP for correct answers
  let xpResult = null;
  if (totalXp > 0) {
    xpResult = await awardXp(userId, "education");
  }

  return NextResponse.json({
    score: correct,
    total: answers.length,
    results,
    xp: xpResult,
  });
}
