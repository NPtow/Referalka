ALTER TABLE "ReferralConnection"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN "adminApprovalToken" TEXT,
ADD COLUMN "paymentRequestEmailSentAt" TIMESTAMP(3),
ADD COLUMN "adminApprovedAt" TIMESTAMP(3);

UPDATE "ReferralConnection"
SET
  "status" = CASE
    WHEN "introEmailSentAt" IS NOT NULL THEN 'APPROVED'
    ELSE 'PENDING_PAYMENT'
  END,
  "adminApprovalToken" = md5("id" || '-' || "companyName" || '-' || "createdAt"::text);

ALTER TABLE "ReferralConnection"
ALTER COLUMN "adminApprovalToken" SET NOT NULL;

CREATE UNIQUE INDEX "ReferralConnection_adminApprovalToken_key"
ON "ReferralConnection"("adminApprovalToken");
