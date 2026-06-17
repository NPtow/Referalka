import { NextRequest } from "next/server";

/**
 * Shared admin gate. Mirrors the existing `?secret=ADMIN_SECRET` convention used
 * by /api/admin/candidates, but also accepts an `x-admin-secret` header so the
 * same secret can be reused across dashboard fetches without leaking into logs.
 */
export function isAdminRequest(req: NextRequest): boolean {
  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("x-admin-secret") ??
    "";

  const expected = process.env.ADMIN_SECRET;
  return Boolean(expected) && provided === expected;
}
