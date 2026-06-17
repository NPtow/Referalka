import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-auth";

const ALLOWED_STATUSES = ["PENDING", "REFERRER_FOUND", "PAID"];

export const dynamic = "force-dynamic";

// Lets an admin move a referral request along its funnel from the dashboard.
export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: unknown; status?: unknown }
    | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status : "";

  if (!id || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "id и валидный status обязательны" },
      { status: 400 },
    );
  }

  const updated = await prisma.referralRequest
    .update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, firstName: true, username: true, photoUrl: true } },
      },
    })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  return NextResponse.json({ request: updated });
}
