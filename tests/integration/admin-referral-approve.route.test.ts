import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createCandidateProfile, createReferrerProfile, createUser } from "@/tests/helpers/factories";
import { disconnectDatabase, resetDatabase } from "@/tests/helpers/db";

const mocks = vi.hoisted(() => ({
  sendReferralIntroEmails: vi.fn(),
}));

vi.mock("@/lib/referral-mail", () => ({
  sendReferralIntroEmails: mocks.sendReferralIntroEmails,
}));

import { POST } from "@/app/api/admin/referral-connections/approve/route";

function buildApproveRequest(token: string) {
  return new NextRequest("http://localhost/api/admin/referral-connections/approve", {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/admin/referral-connections/approve", () => {
  beforeAll(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    mocks.sendReferralIntroEmails.mockReset().mockResolvedValue({ ok: true });
    await resetDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it("approves a pending connection and sends final intro emails", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    const referrer = await createReferrerProfile({
      userId: referrerUser.id,
      companies: ["Т-Банк"],
      roles: ["Product Manager"],
    });

    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const candidateProfile = await createCandidateProfile({
      userId: candidateUser.id,
      companies: ["Т-Банк"],
    });

    const connection = await prisma.referralConnection.create({
      data: {
        candidateUserId: candidateUser.id,
        candidateProfileId: candidateProfile.id,
        referrerUserId: referrerUser.id,
        referrerId: referrer.id,
        companyName: "Т-Банк",
        status: "PENDING_PAYMENT",
        adminApprovalToken: "approve-token",
        paymentRequestEmailSentAt: new Date(),
      },
    });

    const response = await POST(buildApproveRequest(connection.adminApprovalToken));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alreadyApproved).toBe(false);
    expect(mocks.sendReferralIntroEmails).toHaveBeenCalledTimes(1);

    const updated = await prisma.referralConnection.findUniqueOrThrow({ where: { id: connection.id } });
    expect(updated.status).toBe("APPROVED");
    expect(updated.adminApprovedAt).not.toBeNull();
    expect(updated.introEmailSentAt).not.toBeNull();
  });

  it("returns alreadyApproved for an already approved connection", async () => {
    const referrerUser = await createUser({ firstName: "Referrer", username: "referrer@example.com" });
    const referrer = await createReferrerProfile({ userId: referrerUser.id, companies: ["Т-Банк"] });

    const candidateUser = await createUser({ firstName: "Candidate", username: "candidate@example.com" });
    const candidateProfile = await createCandidateProfile({ userId: candidateUser.id, companies: ["Т-Банк"] });

    const connection = await prisma.referralConnection.create({
      data: {
        candidateUserId: candidateUser.id,
        candidateProfileId: candidateProfile.id,
        referrerUserId: referrerUser.id,
        referrerId: referrer.id,
        companyName: "Т-Банк",
        status: "APPROVED",
        adminApprovalToken: "approve-token-2",
        paymentRequestEmailSentAt: new Date(),
        adminApprovedAt: new Date(),
        introEmailSentAt: new Date(),
      },
    });

    const response = await POST(buildApproveRequest(connection.adminApprovalToken));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alreadyApproved).toBe(true);
    expect(mocks.sendReferralIntroEmails).not.toHaveBeenCalled();
  });
});
