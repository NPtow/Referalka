import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

function serializeReferrer(referrer: {
  id: string;
  userId: number;
  company: string | null;
  companies: string[];
  role: string | null;
  roles: string[];
  telegramContact: string | null;
  linkedinUrl: string | null;
  createdAt: Date;
}) {
  const companies = referrer.companies.length ? referrer.companies : [referrer.company];
  const roles = referrer.roles.length ? referrer.roles : referrer.role ? [referrer.role] : [];

  return {
    ...referrer,
    companies,
    company: companies[0] ?? referrer.company ?? null,
    roles,
    role: roles[0] ?? referrer.role ?? null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveCurrentAppUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const companies = normalizeStringArray(body.companies);
    const fallbackCompany = normalizeString(body.company);
    const resolvedCompanies = companies.length ? companies : fallbackCompany ? [fallbackCompany] : [];
    const roles = normalizeStringArray(body.roles);
    const fallbackRole = normalizeString(body.role);
    const resolvedRoles = roles.length ? roles : fallbackRole ? [fallbackRole] : [];
    const linkedinUrl = normalizeString(body.linkedinUrl);
    const telegramContact = normalizeString(body.telegramContact);

    const referrer = await prisma.referrer.upsert({
      where: { userId: user.id },
      update: {
        company: resolvedCompanies[0] ?? null,
        companies: resolvedCompanies,
        role: resolvedRoles[0] ?? null,
        roles: resolvedRoles,
        linkedinUrl,
        telegramContact,
      },
      create: {
        userId: user.id,
        company: resolvedCompanies[0] ?? null,
        companies: resolvedCompanies,
        role: resolvedRoles[0] ?? null,
        roles: resolvedRoles,
        linkedinUrl,
        telegramContact,
      },
      include: { user: { select: { firstName: true, username: true } } },
    });

    return NextResponse.json({ referrer: serializeReferrer(referrer) });
  } catch (e) {
    console.error("[referrer POST]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  const user = await resolveCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const referrer = await prisma.referrer.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ referrer: referrer ? serializeReferrer(referrer) : null });
}
