import { NextResponse } from "next/server";
import { resolveTelegramBotUsername } from "@/lib/telegram";

export async function POST() {
  const botUsername = await resolveTelegramBotUsername();

  if (!botUsername) {
    return NextResponse.json(
      { error: "Не удалось определить username бота. Укажи TELEGRAM_BOT_USERNAME в .env" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    botUrl: `https://t.me/${botUsername}`,
    botDeepLink: `tg://resolve?domain=${botUsername}`,
  });
}
