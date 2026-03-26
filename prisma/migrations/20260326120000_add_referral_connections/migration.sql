ALTER TABLE "Profile"
ADD COLUMN "shareWithMatchingReferrers" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "ReferralConnection" (
  "id" TEXT NOT NULL,
  "candidateUserId" INTEGER NOT NULL,
  "candidateProfileId" TEXT NOT NULL,
  "referrerUserId" INTEGER NOT NULL,
  "referrerId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "introEmailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReferralConnection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReferralConnection_candidateUserId_referrerUserId_companyName_key"
ON "ReferralConnection"("candidateUserId", "referrerUserId", "companyName");

CREATE INDEX "ReferralConnection_candidateUserId_createdAt_idx"
ON "ReferralConnection"("candidateUserId", "createdAt");

CREATE INDEX "ReferralConnection_referrerUserId_createdAt_idx"
ON "ReferralConnection"("referrerUserId", "createdAt");

ALTER TABLE "ReferralConnection"
ADD CONSTRAINT "ReferralConnection_candidateUserId_fkey"
FOREIGN KEY ("candidateUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReferralConnection"
ADD CONSTRAINT "ReferralConnection_candidateProfileId_fkey"
FOREIGN KEY ("candidateProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReferralConnection"
ADD CONSTRAINT "ReferralConnection_referrerUserId_fkey"
FOREIGN KEY ("referrerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReferralConnection"
ADD CONSTRAINT "ReferralConnection_referrerId_fkey"
FOREIGN KEY ("referrerId") REFERENCES "Referrer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
