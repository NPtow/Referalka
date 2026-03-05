-- Add Clerk identity mapping to users
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkUserId_key" ON "User"("clerkUserId");

-- Remove legacy one-time auth codes table
DROP TABLE IF EXISTS "PendingAuth";
