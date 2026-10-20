ALTER TABLE "certificate_requests"
ADD COLUMN "purchase_certificate_delivered_at" TIMESTAMP(3),
ADD COLUMN "purchase_certificate_stock_seen_at" TIMESTAMP(3);

UPDATE "certificate_requests"
SET "purchase_certificate_stock_seen_at" = "completed_at"
WHERE "status" = 'CONCLUIDA'
  AND "completed_at" IS NOT NULL;
