import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const company = searchParams.get("company");
  const countOnly = searchParams.get("count") === "true";

  if (!company) {
    return NextResponse.json({ error: "company param required" }, { status: 400 });
  }

  if (countOnly) {
    const count = await prisma.vacancy.count({ where: { companySlug: company, isActive: true } });
    return NextResponse.json({ count });
  }

  const vacancies = await prisma.vacancy.findMany({
    where: { companySlug: company, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vacancies });
}
