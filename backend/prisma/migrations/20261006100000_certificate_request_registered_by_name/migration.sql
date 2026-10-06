ALTER TABLE "certificate_requests" ADD COLUMN "registered_by_name" TEXT;

UPDATE "certificate_requests" AS cr
SET "registered_by_name" = COALESCE(
  NULLIF(TRIM(u.name), ''),
  'Cartão ' || u.card_number
)
FROM "users" AS u
WHERE u.id = cr.created_by_user_id;

ALTER TABLE "certificate_requests" ALTER COLUMN "registered_by_name" SET NOT NULL;
