import { NextResponse } from "next/server";

export async function GET() {
  const botId = process.env.TELEGRAM_BOT_ID;
  const appUrl = process.env.APP_URL;

  if (!botId || !appUrl) {
    return NextResponse.json(
      { error: `Missing env: ${!botId ? "TELEGRAM_BOT_ID" : "APP_URL"}` },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    bot_id: botId,
    origin: appUrl,
    return_to: `${appUrl}/api/auth/telegram/debug`,
  });

  return NextResponse.json({ url: `https://oauth.telegram.org/auth?${params.toString()}` });
}
