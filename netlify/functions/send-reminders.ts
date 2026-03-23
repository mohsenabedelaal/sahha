import type { Config } from "@netlify/functions";

export default async function handler() {
  const baseUrl = process.env.URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const secret = process.env.CRON_SECRET ?? "";

  const res = await fetch(`${baseUrl}/api/cron/send-reminders?secret=${secret}`);
  const data = await res.json();
  console.log("send-reminders result:", data);
}

export const config: Config = {
  schedule: "0 * * * *",
};
