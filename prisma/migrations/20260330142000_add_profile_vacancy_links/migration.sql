ALTER TABLE "Profile"
ADD COLUMN "vacancyLinks" JSONB NOT NULL DEFAULT '{}'::jsonb;
