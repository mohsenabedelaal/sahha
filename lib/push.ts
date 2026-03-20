import webPush from "web-push";
import { db } from "./db";
import { notificationSubscriptions } from "./db/schema";
import { eq } from "drizzle-orm";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hello@sahha.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(
  userId: number,
  title: string,
  body: string,
  url?: string
) {
  const subscriptions = await db
    .select()
    .from(notificationSubscriptions)
    .where(eq(notificationSubscriptions.user_id, userId));

  const payload = JSON.stringify({
    title,
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: { url: url || "/dashboard" },
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
    )
  );

  // Clean up expired subscriptions
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "rejected") {
      await db
        .delete(notificationSubscriptions)
        .where(eq(notificationSubscriptions.id, subscriptions[i].id));
    }
  }

  return results.filter((r) => r.status === "fulfilled").length;
}
