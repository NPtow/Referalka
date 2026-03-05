import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const text: string = message.text;

    const startMatch = text.match(/^\/start(?:@\w+)?(?:\s+(.+))?$/);
    if (!startMatch) {
      return NextResponse.json({ ok: true });
    }

    const payload = startMatch[1]?.trim();
    if (!payload) {
      await sendTelegramMessage(
        message.from.id,
        "Чтобы войти, нажми на кнопку входа на сайте и перейди в бота по ссылке из сайта."
      );
      return NextResponse.json({ ok: true });
    }

    if (!payload.startsWith("login_")) {
      await sendTelegramMessage(message.from.id, "Неизвестная команда. Запусти вход заново с сайта.");
      return NextResponse.json({ ok: true });
    }

    const token = payload.replace("login_", "").trim();
    if (!/^\d{6}$/.test(token)) {
      await sendTelegramMessage(message.from.id, "Код входа некорректный. Запусти вход заново с сайта.");
      return NextResponse.json({ ok: true });
    }
    const from = message.from;

    console.log("[Bot Webhook] Auth attempt. token:", token, "userId:", from.id);

    const pending = await prisma.pendingAuth.findUnique({ where: { token } });

    if (!pending || pending.expiresAt < new Date()) {
      console.log("[Bot Webhook] Token not found or expired:", token);
      await sendTelegramMessage(from.id, "Ссылка устарела. Попробуй войти заново на сайте.");
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.upsert({
      where: { id: from.id },
      update: {
        firstName: from.first_name,
        username: from.username ?? null,
        photoUrl: from.photo ?? null,
      },
      create: {
        id: from.id,
        firstName: from.first_name,
        username: from.username ?? null,
        photoUrl: null,
      },
    });

    await prisma.pendingAuth.update({
      where: { token },
      data: { userId: user.id },
    });

    await sendTelegramMessage(
      from.id,
      `Код для входа в Рефералку: <b>${token}</b>\n\nВведи его на сайте в течение 10 минут.`
    );

    console.log("[Bot Webhook] Success. userId:", user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Bot Webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}
