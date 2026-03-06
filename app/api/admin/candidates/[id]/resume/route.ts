import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { resumeFileUrl: true },
  });

  if (!profile?.resumeFileUrl) {
    return NextResponse.json({ error: "Resume file not found" }, { status: 404 });
  }

  return NextResponse.redirect(profile.resumeFileUrl);
}
