import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createReferrerProfile, createUser, loadAppUser } from "@/tests/helpers/factories";
import { disconnectDatabase, resetDatabase } from "@/tests/helpers/db";

const mocks = vi.hoisted(() => ({
  resolveCurrentAppUser: vi.fn(),
  sendApplicationEmail: vi.fn(),
  sendMatchingCandidateEmailToReferrer: vi.fn(),
}));

vi.mock("@/lib/resolve-current-app-user", () => ({
  resolveCurrentAppUser: mocks.resolveCurrentAppUser,
}));

vi.mock("@/lib/application-mail", () => ({
  sendApplicationEmail: mocks.sendApplicationEmail,
}));

vi.mock("@/lib/referral-mail", () => ({
  sendMatchingCandidateEmailToReferrer: mocks.sendMatchingCandidateEmailToReferrer,
}));

import { POST } from "@/app/api/profile/submit/route";

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

describe("POST /api/profile/submit", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    mocks.resolveCurrentAppUser.mockReset();
    mocks.sendApplicationEmail.mockReset().mockResolvedValue({ ok: true });
    mocks.sendMatchingCandidateEmailToReferrer.mockReset().mockResolvedValue({ ok: true });
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("stores applicationSubmittedAt and notifies matching referrers on first submit", async () => {
    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк"],
      roles: ["Product Manager"],
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(candidateUser.id));

    const response = await POST(
      new NextRequest("http://localhost/api/profile/submit", {
        method: "POST",
        body: JSON.stringify(buildPayload(["Т-Банк"])),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.referrerNotificationsSent).toBe(1);
    expect(mocks.sendApplicationEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMatchingCandidateEmailToReferrer).toHaveBeenCalledTimes(1);
    expect(json.profile.applicationSubmittedAt).toBeTruthy();
    expect(json.profile.vacancyLinks).toEqual({ "Т-Банк": "https://example.com/%D0%A2-%D0%91%D0%B0%D0%BD%D0%BA" });
  });

  it("does not re-notify referrers when the company list is unchanged", async () => {
    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк", "Яндекс"],
      roles: ["Product Manager"],
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(candidateUser.id));

    await POST(
      new NextRequest("http://localhost/api/profile/submit", {
        method: "POST",
        body: JSON.stringify(buildPayload(["Т-Банк"])),
        headers: { "Content-Type": "application/json" },
      }),
    );

    mocks.sendApplicationEmail.mockClear();
    mocks.sendMatchingCandidateEmailToReferrer.mockClear();

    const secondResponse = await POST(
      new NextRequest("http://localhost/api/profile/submit", {
        method: "POST",
        body: JSON.stringify(buildPayload(["Т-Банк"])),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const secondJson = await secondResponse.json();

    expect(secondResponse.status).toBe(200);
    expect(secondJson.referrerNotificationsSent).toBe(0);
    expect(mocks.sendApplicationEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMatchingCandidateEmailToReferrer).not.toHaveBeenCalled();
  });

  it("rejects submit when one of selected companies has no vacancy link", async () => {
    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(candidateUser.id));

    const response = await POST(
      new NextRequest("http://localhost/api/profile/submit", {
        method: "POST",
        body: JSON.stringify({
          ...buildPayload(["Т-Банк", "Яндекс"]),
          vacancyLinks: { "Т-Банк": "https://example.com/tbank" },
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Добавь ссылку на вакансию для каждой выбранной компании.");
    expect(mocks.sendApplicationEmail).not.toHaveBeenCalled();
  });
});
