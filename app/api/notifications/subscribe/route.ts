import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const body = await req.json();
  const { endpoint, p256dh, auth: authKey } = body as {
    endpoint: string;
    p256dh: string;
    auth: string;
  };

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
  }

  // Check if subscription already exists
  const [existing] = await db
    .select()
    .from(notificationSubscriptions)
    .where(
      and(
        eq(notificationSubscriptions.user_id, userId),
        eq(notificationSubscriptions.endpoint, endpoint)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ success: true, message: "Already subscribed" });
  }

  await db.insert(notificationSubscriptions).values({
    user_id: userId,
    endpoint,
    p256dh,
    auth: authKey,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
