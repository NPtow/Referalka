import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createUser, loadAppUser } from "@/tests/helpers/factories";
import { disconnectDatabase, resetDatabase } from "@/tests/helpers/db";

const mocks = vi.hoisted(() => ({
  resolveCurrentAppUser: vi.fn(),
}));

vi.mock("@/lib/resolve-current-app-user", () => ({
  resolveCurrentAppUser: mocks.resolveCurrentAppUser,
}));

import { GET, POST } from "@/app/api/referrer/route";

describe("referrer draft route", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    mocks.resolveCurrentAppUser.mockReset();
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("stores incomplete referrer draft without companies and roles", async () => {
    const user = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(user.id));

    const response = await POST(
      new NextRequest("http://localhost/api/referrer", {
        method: "POST",
        body: JSON.stringify({
          companies: [],
          roles: [],
          telegramContact: "@ref-draft",
          linkedinUrl: "https://linkedin.com/in/ref-draft",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.referrer.companies).toEqual([]);
    expect(json.referrer.company).toBeNull();
    expect(json.referrer.roles).toEqual([]);
    expect(json.referrer.role).toBeNull();
    expect(json.referrer.telegramContact).toBe("@ref-draft");

    const getResponse = await GET();
    const getJson = await getResponse.json();
    expect(getResponse.status).toBe(200);
    expect(getJson.referrer.company).toBeNull();
    expect(getJson.referrer.roles).toEqual([]);
  });
});
