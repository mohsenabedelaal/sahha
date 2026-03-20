import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDailyChallenge, updateChallengeProgress } from "@/lib/gamification-engine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const challenge = await getDailyChallenge(Number(session.user.id));
  return NextResponse.json({ challenge });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { challengeId, incrementBy = 1 } = body as { challengeId: number; incrementBy?: number };

  const result = await updateChallengeProgress(
    Number(session.user.id),
    challengeId,
    incrementBy
  );

  return NextResponse.json({ progress: result });
}
