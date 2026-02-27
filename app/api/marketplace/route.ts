import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const role = searchParams.get("role");
    const company = searchParams.get("company");
    const minExp = searchParams.get("minExp");
    const maxExp = searchParams.get("maxExp");
    const relocation = searchParams.get("relocation");

    const candidates = await prisma.profile.findMany({
      where: {
        isPublic: true,
        ...(role && { role }),
        ...(company && { companies: { has: company } }),
        ...(minExp !== null && { experience: { gte: Number(minExp) } }),
        ...(maxExp !== null && { experience: { lte: Number(maxExp) } }),
        ...(relocation === "true" && { openToRelocation: true }),
      },
      include: {
        user: { select: { firstName: true, username: true, photoUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ candidates });
  } catch (e) {
    console.error("[marketplace GET]", e);
    return NextResponse.json({ candidates: [] }, { status: 500 });
  }
}
