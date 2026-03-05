import { NextResponse } from "next/server";

export async function GET() {
  const botId = process.env.TELEGRAM_BOT_ID!;
  const appUrl = process.env.APP_URL!;

  const params = new URLSearchParams({
    bot_id: botId,
    origin: appUrl,
    embed: "1",
    request_access: "write",
    return_to: `${appUrl}/api/auth/telegram/callback`,
  });

  return NextResponse.json({ url: `https://oauth.telegram.org/auth?${params.toString()}` });
}
