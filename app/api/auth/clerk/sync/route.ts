import { NextResponse } from "next/server";
import { resolveCurrentAppUser } from "@/lib/resolve-current-app-user";

export async function POST() {
  try {
    const user = await resolveCurrentAppUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ redirect: "/profile" });
  } catch (err) {
    console.error("[Clerk Sync] Error:", err);
    return NextResponse.json({ error: "Unable to sync user" }, { status: 500 });
  }
}
