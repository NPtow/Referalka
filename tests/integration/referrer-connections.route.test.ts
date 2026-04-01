import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createCandidateProfile, createReferrerProfile, createUser, loadAppUser } from "@/tests/helpers/factories";
import { disconnectDatabase, resetDatabase } from "@/tests/helpers/db";

const mocks = vi.hoisted(() => ({
  resolveCurrentAppUser: vi.fn(),
  sendReferralMatchPendingEmails: vi.fn(),
}));

vi.mock("@/lib/resolve-current-app-user", () => ({
  resolveCurrentAppUser: mocks.resolveCurrentAppUser,
}));

vi.mock("@/lib/referral-mail", () => ({
  sendReferralMatchPendingEmails: mocks.sendReferralMatchPendingEmails,
}));

import { POST } from "@/app/api/referrer/connections/route";

function buildConnectionRequest(candidateId: string, companyName: string) {
  return new NextRequest("http://localhost/api/referrer/connections", {
    method: "POST",
    body: JSON.stringify({ candidateId, companyName }),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/referrer/connections", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    mocks.resolveCurrentAppUser.mockReset();
    mocks.sendReferralMatchPendingEmails.mockReset().mockResolvedValue({ ok: true });
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("creates a pending connection once and does not duplicate payment emails", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк"],
      roles: ["Product Manager"],
    });

    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const candidateProfile = await createCandidateProfile({
      userId: candidateUser.id,
      companies: ["Т-Банк"],
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(referrerUser.id));

    const firstResponse = await POST(buildConnectionRequest(candidateProfile.id, "Т-Банк"));
    const firstJson = await firstResponse.json();
    const secondResponse = await POST(buildConnectionRequest(candidateProfile.id, "Т-Банк"));
    const secondJson = await secondResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(firstJson.alreadyExists).toBe(false);
    expect(firstJson.status).toBe("PENDING_PAYMENT");
    expect(secondResponse.status).toBe(200);
    expect(secondJson.alreadyExists).toBe(true);
    expect(secondJson.status).toBe("PENDING_PAYMENT");
    expect(mocks.sendReferralMatchPendingEmails).toHaveBeenCalledTimes(1);

    const connections = await prisma.referralConnection.findMany();
    expect(connections).toHaveLength(1);
    expect(connections[0].companyName).toBe("Т-Банк");
    expect(connections[0].status).toBe("PENDING_PAYMENT");
    expect(connections[0].paymentRequestEmailSentAt).not.toBeNull();
    expect(connections[0].introEmailSentAt).toBeNull();
    expect(connections[0].adminApprovalToken).toBeTruthy();
  });

  it("returns 400 when company does not overlap", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Яндекс"],
      roles: ["Product Manager"],
    });

    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const candidateProfile = await createCandidateProfile({
      userId: candidateUser.id,
      companies: ["Т-Банк"],
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(referrerUser.id));

    const response = await POST(
      buildConnectionRequest(candidateProfile.id, "Т-Банк"),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Эта компания не совпадает с профилем реферала.");
  });

  it("returns 502 when payment request email transport fails", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк"],
      roles: ["Product Manager"],
    });

    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const candidateProfile = await createCandidateProfile({
      userId: candidateUser.id,
      companies: ["Т-Банк"],
    });

    mocks.resolveCurrentAppUser.mockResolvedValue(await loadAppUser(referrerUser.id));
    mocks.sendReferralMatchPendingEmails.mockResolvedValue({ ok: false, error: "boom" });

    const response = await POST(
      buildConnectionRequest(candidateProfile.id, "Т-Банк"),
    );
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json.error).toBe("boom");

    const connection = await prisma.referralConnection.findFirstOrThrow();
    expect(connection.introEmailSentAt).toBeNull();
    expect(connection.paymentRequestEmailSentAt).toBeNull();
    expect(connection.status).toBe("PENDING_PAYMENT");
  });
});
