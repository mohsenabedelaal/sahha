import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, mealLogs, notificationSubscriptions } from "@/lib/db/schema";
import { eq, and, gte, lt, count } from "drizzle-orm";
import { sendPushNotification } from "@/lib/push";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hour = new Date().getHours();
  const today = new Date().toISOString().split("T")[0];

  // Determine which meal reminder to send based on hour
  let mealType: string | null = null;
  let message = "";
  if (hour >= 7 && hour <= 9) {
    mealType = "breakfast";
    message = "Good morning! Don't forget to log your breakfast.";
  } else if (hour >= 12 && hour <= 13) {
    mealType = "lunch";
    message = "Lunchtime! Remember to log what you eat.";
  } else if (hour >= 18 && hour <= 20) {
    mealType = "dinner";
    message = "Time for dinner! Log your meal to keep your streak going.";
  } else if (hour >= 21 && hour <= 22) {
    message = "End of day! Make sure all your meals are logged.";
  }

  if (!message) {
    return NextResponse.json({ sent: 0, message: "Not a reminder hour" });
  }

  // Get users with push subscriptions
  const subscribers = await db
    .selectDistinct({ user_id: notificationSubscriptions.user_id })
    .from(notificationSubscriptions);

  let sent = 0;
  for (const { user_id } of subscribers) {
    // Skip if they already logged this meal type today
    if (mealType) {
      const [logged] = await db
        .select({ cnt: count() })
        .from(mealLogs)
        .where(
          and(
            eq(mealLogs.user_id, user_id),
            eq(mealLogs.meal_type, mealType),
            gte(mealLogs.logged_at, `${today} 00:00:00`),
            lt(mealLogs.logged_at, `${today}T23:59:59`)
          )
        );
      if ((logged?.cnt || 0) > 0) continue;
    }

    const count_sent = await sendPushNotification(user_id, "Sahha Reminder", message, "/log");
    if (count_sent > 0) sent++;
  }

  return NextResponse.json({ sent });
}
