-- AlterTable
ALTER TABLE "certificate_requests" ADD COLUMN "invoice_number" TEXT;

UPDATE "certificate_requests"
SET "invoice_number" = CONCAT('NF-', "id")
WHERE "invoice_number" IS NULL;

ALTER TABLE "certificate_requests" ALTER COLUMN "invoice_number" SET NOT NULL;

ALTER TABLE "certificate_requests" ALTER COLUMN "expected_certificates" SET DEFAULT 1;
