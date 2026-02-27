import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const { vacancyId, adminSecret } = await req.json();

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!vacancyId) {
    return NextResponse.json({ error: "vacancyId required" }, { status: 400 });
  }

  const vacancy = await prisma.vacancy.findUnique({ where: { id: vacancyId } });
  if (!vacancy) {
    return NextResponse.json({ error: "Vacancy not found" }, { status: 404 });
  }

  // Find all public profiles that want to work at this company (by slug or name match)
  const profiles = await prisma.profile.findMany({
    where: {
      isPublic: true,
      companies: { has: vacancy.companySlug },
    },
    select: { userId: true, role: true },
  });

  const text =
    `🚀 Новая вакансия для тебя!\n\n` +
    `<b>${vacancy.title}</b> · ${vacancy.level}\n` +
    `Компания: ${vacancy.companySlug}\n` +
    (vacancy.salary ? `Зарплата: ${vacancy.salary}\n` : "") +
    `\nОткрой маркетплейс, чтобы узнать подробнее.`;

  const results = await Promise.allSettled(
    profiles.map((p) => sendTelegramMessage(p.userId, text))
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: profiles.length });
}
