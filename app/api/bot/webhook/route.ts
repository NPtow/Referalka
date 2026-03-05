import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update?.message;

    if (!message?.text || !message?.from?.id) {
      return NextResponse.json({ ok: true });
    }

    const text: string = message.text;
    const startMatch = text.match(/^\/start(?:@\w+)?/);

    if (!startMatch) {
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      Number(message.from.id),
      "Авторизация в Рефералке перенесена на вход через сайт. Открой сайт и нажми Sign Up / Sign In."
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Bot Webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}
