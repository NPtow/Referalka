-- CreateTable: ProfileView
CREATE TABLE IF NOT EXISTS "ProfileView" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProfileView_profileId_idx" ON "ProfileView"("profileId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
