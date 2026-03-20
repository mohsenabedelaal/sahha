import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { waterLogs } from "@/lib/db/schema";
import { eq, and, gte, lt, sql, sum } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const today = new Date().toISOString().split("T")[0];

  const [result] = await db
    .select({ total_ml: sum(waterLogs.amount_ml) })
    .from(waterLogs)
    .where(
      and(
        eq(waterLogs.user_id, userId),
        gte(waterLogs.logged_at, `${today} 00:00:00`),
        lt(waterLogs.logged_at, `${today}T23:59:59`)
      )
    );

  const totalMl = Number(result?.total_ml || 0);
  const glasses = Math.floor(totalMl / 250);

  return NextResponse.json({ glasses, total_ml: totalMl });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();
  const { amount_ml = 250 } = body as { amount_ml?: number };

  const [entry] = await db
    .insert(waterLogs)
    .values({
      user_id: userId,
      amount_ml,
      logged_at: sql`(datetime('now'))`,
    })
    .returning();

  // Return updated total
  const today = new Date().toISOString().split("T")[0];
  const [result] = await db
    .select({ total_ml: sum(waterLogs.amount_ml) })
    .from(waterLogs)
    .where(
      and(
        eq(waterLogs.user_id, userId),
        gte(waterLogs.logged_at, `${today} 00:00:00`),
        lt(waterLogs.logged_at, `${today}T23:59:59`)
      )
    );

  const totalMl = Number(result?.total_ml || 0);
  const glasses = Math.floor(totalMl / 250);

  return NextResponse.json({ entry, glasses, total_ml: totalMl });
}
