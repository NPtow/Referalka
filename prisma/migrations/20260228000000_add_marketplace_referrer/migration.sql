-- AlterTable: Add marketplace/profile fields to Profile
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "openToRelocation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "resumeText" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "summary" TEXT;

-- CreateTable: Referrer
CREATE TABLE IF NOT EXISTS "Referrer" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referrer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Referrer userId unique
CREATE UNIQUE INDEX IF NOT EXISTS "Referrer_userId_key" ON "Referrer"("userId");

-- AddForeignKey: Referrer → User
DO $$ BEGIN
  ALTER TABLE "Referrer" ADD CONSTRAINT "Referrer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: Vacancy
CREATE TABLE IF NOT EXISTS "Vacancy" (
    "id" TEXT NOT NULL,
    "companySlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tags" TEXT[],
    "salary" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Vacancy companySlug
CREATE INDEX IF NOT EXISTS "Vacancy_companySlug_idx" ON "Vacancy"("companySlug");
