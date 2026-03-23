ALTER TABLE "Referrer"
ADD COLUMN "companies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Referrer"
ADD COLUMN "role" TEXT;

ALTER TABLE "Referrer"
ADD COLUMN "roles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Referrer"
SET "companies" = ARRAY["company"]::TEXT[]
WHERE COALESCE(array_length("companies", 1), 0) = 0
  AND "company" IS NOT NULL;
