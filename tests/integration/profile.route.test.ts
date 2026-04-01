import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createUser, loadAppUser } from "@/tests/helpers/factories";
import { disconnectDatabase, resetDatabase } from "@/tests/helpers/db";

const mocks = vi.hoisted(() => ({
  resolveCurrentAppUser: vi.fn(),
  getBetterAuthSession: vi.fn(),
}));

vi.mock("@/lib/resolve-current-app-user", () => ({
  resolveCurrentAppUser: mocks.resolveCurrentAppUser,
}));

vi.mock("@/lib/auth-session", () => ({
  getBetterAuthSession: mocks.getBetterAuthSession,
}));

import { GET, PATCH, POST } from "@/app/api/profile/route";

function buildPayload(companies: string[]) {
  return {
    roles: ["Product Manager"],
    companies,
    vacancyLinks: Object.fromEntries(companies.map((company) => [company, `https://example.com/${encodeURIComponent(company)}`])),
    experience: 4,
    location: "Москва",
    resumeUrl: "https://example.com/resume.pdf",
    resumeText: "Resume text",
    telegramContact: "@candidate",
    linkedinUrl: "https://linkedin.com/in/candidate",
    githubUrl: "https://github.com/candidate",
    siteUrl: "https://example.com",
    bio: "Коротко о себе",
    openToRelocation: false,
    isPublic: false,
    shareWithMatchingReferrers: false,
  };
}

describe("candidate profile route", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    mocks.resolveCurrentAppUser.mockReset();
    mocks.getBetterAuthSession.mockReset();
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("stores and returns vacancy links", async () => {
    const user = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(user.id));

    const createResponse = await POST(
      new NextRequest("http://localhost/api/profile", {
        method: "POST",
        body: JSON.stringify(buildPayload(["Т-Банк", "Яндекс"])),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(createResponse.status).toBe(200);

    const getResponse = await GET();
    const getJson = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(getJson.profile.vacancyLinks).toEqual({
      "Т-Банк": "https://example.com/%D0%A2-%D0%91%D0%B0%D0%BD%D0%BA",
      "Яндекс": "https://example.com/%D0%AF%D0%BD%D0%B4%D0%B5%D0%BA%D1%81",
    });
  });

  it("cleans removed company links on patch", async () => {
    const user = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(user.id));

    await POST(
      new NextRequest("http://localhost/api/profile", {
        method: "POST",
        body: JSON.stringify(buildPayload(["Т-Банк", "Яндекс"])),
        headers: { "Content-Type": "application/json" },
      }),
    );

    const patchResponse = await PATCH(
      new NextRequest("http://localhost/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          companies: ["Т-Банк"],
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const patchJson = await patchResponse.json();

    expect(patchResponse.status).toBe(200);
    expect(patchJson.profile.vacancyLinks).toEqual({
      "Т-Банк": "https://example.com/%D0%A2-%D0%91%D0%B0%D0%BD%D0%BA",
    });

    const storedProfile = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
    expect(storedProfile.vacancyLinks).toEqual({
      "Т-Банк": "https://example.com/%D0%A2-%D0%91%D0%B0%D0%BD%D0%BA",
    });
  });

  it("stores incomplete candidate draft without submitting application", async () => {
    const user = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(user.id));

    const response = await POST(
      new NextRequest("http://localhost/api/profile", {
        method: "POST",
        body: JSON.stringify({
          roles: [],
          companies: ["Т-Банк"],
          vacancyLinks: {},
          experience: 0,
          resumeText: "",
          bio: "Черновик без полной анкеты",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.profile.applicationSubmittedAt).toBeNull();
    expect(json.profile.companies).toEqual(["Т-Банк"]);
    expect(json.profile.vacancyLinks).toEqual({});
    expect(json.profile.bio).toBe("Черновик без полной анкеты");
  });
});
