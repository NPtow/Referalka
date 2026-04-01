import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createCandidateProfile, createReferrerProfile, createUser, loadAppUser } from "@/tests/helpers/factories";
import { disconnectDatabase, resetDatabase } from "@/tests/helpers/db";

const mocks = vi.hoisted(() => ({
  resolveCurrentAppUser: vi.fn(),
}));

vi.mock("@/lib/resolve-current-app-user", () => ({
  resolveCurrentAppUser: mocks.resolveCurrentAppUser,
}));

import { GET } from "@/app/api/referrer/candidates/route";

describe("GET /api/referrer/candidates", () => {
  beforeEach(async () => {
    mocks.resolveCurrentAppUser.mockReset();
    await resetDatabase();
  });

  beforeAll(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("returns only submitted candidates with overlapping companies", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк", "Яндекс"],
      roles: ["Product Manager"],
    });

    const matchingUser = await createUser({ firstName: "Matching", username: "matching@example.com" });
    await createCandidateProfile({
      userId: matchingUser.id,
      companies: ["Т-Банк", "VK"],
      roles: ["Analyst"],
    });

    const wrongCompanyUser = await createUser({ firstName: "Wrong Company", username: "wrong@example.com" });
    await createCandidateProfile({
      userId: wrongCompanyUser.id,
      companies: ["VK"],
      roles: ["Analyst"],
    });

    const notSubmittedUser = await createUser({ firstName: "Draft", username: "draft@example.com" });
    await createCandidateProfile({
      userId: notSubmittedUser.id,
      companies: ["Т-Банк"],
      applicationSubmittedAt: null,
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(referrerUser.id));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.candidates).toHaveLength(1);
    expect(json.candidates[0].user.firstName).toBe("Matching");
    expect(json.candidates[0].sharedCompanies).toEqual(["Т-Банк"]);
    expect(json.candidates[0].availableCompanies).toEqual(["Т-Банк"]);
    expect(json.candidates[0].vacancyLinks).toEqual({
      "Т-Банк": "https://example.com/vacancies/%D0%A2-%D0%91%D0%B0%D0%BD%D0%BA",
      VK: "https://example.com/vacancies/VK",
    });
    expect(json.candidates[0].sharedCompaniesMissingVacancyLinks).toEqual([]);
  });

  it("marks pending and approved companies as unavailable", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    const referrer = await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк", "Яндекс"],
      roles: ["Product Manager"],
    });

    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const candidateProfile = await createCandidateProfile({
      userId: candidateUser.id,
      companies: ["Т-Банк", "Яндекс"],
    });

    await prisma.referralConnection.create({
      data: {
        candidateUserId: candidateUser.id,
        candidateProfileId: candidateProfile.id,
        referrerUserId: referrerUser.id,
        referrerId: referrer.id,
        companyName: "Т-Банк",
        status: "PENDING_PAYMENT",
        adminApprovalToken: "token-pending",
      },
    });

    await prisma.referralConnection.create({
      data: {
        candidateUserId: candidateUser.id,
        candidateProfileId: candidateProfile.id,
        referrerUserId: referrerUser.id,
        referrerId: referrer.id,
        companyName: "Яндекс",
        status: "APPROVED",
        adminApprovalToken: "token-approved",
        introEmailSentAt: new Date(),
      },
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(referrerUser.id));

    const response = await GET();
    const json = await response.json();

    expect(json.candidates).toHaveLength(1);
    expect(json.candidates[0].availableCompanies).toEqual([]);
    expect(json.candidates[0].pendingCompanies).toEqual(["Т-Банк"]);
    expect(json.candidates[0].connectedCompanies).toEqual(["Яндекс"]);
  });

  it("marks legacy candidates without vacancy links as incomplete", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк"],
      roles: ["Product Manager"],
    });

    const candidateUser = await createUser({ firstName: "Legacy", username: "legacy@example.com" });
    await createCandidateProfile({
      userId: candidateUser.id,
      companies: ["Т-Банк"],
      vacancyLinks: {},
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(referrerUser.id));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.candidates).toHaveLength(1);
    expect(json.candidates[0].sharedCompaniesMissingVacancyLinks).toEqual(["Т-Банк"]);
    expect(json.candidates[0].vacancyLinks).toEqual({});
  });
});
