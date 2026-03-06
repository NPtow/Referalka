-- Profile shape for single-flow submit
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "roles" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "resumeFileUrl" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "resumeFileName" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "resumeFileMime" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "resumeFileSize" INTEGER;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "applicationSubmittedAt" TIMESTAMP(3);

UPDATE "Profile"
SET "roles" = CASE
  WHEN "roles" IS NULL OR array_length("roles", 1) IS NULL THEN ARRAY["role"]::TEXT[]
  ELSE "roles"
END;
