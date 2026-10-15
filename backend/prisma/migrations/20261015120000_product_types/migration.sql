CREATE TABLE "product_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_types_code_key" ON "product_types"("code");

INSERT INTO "product_types" ("code", "name", "active") VALUES ('CHAPA', 'Chapa', true);

ALTER TABLE "quality_documents" ADD COLUMN "product_type_id" INTEGER;

UPDATE "quality_documents"
SET "product_type_id" = (SELECT "id" FROM "product_types" WHERE "code" = 'CHAPA' LIMIT 1);

ALTER TABLE "quality_documents" ALTER COLUMN "product_type_id" SET NOT NULL;

DROP INDEX "quality_documents_year_version_number_key";

CREATE UNIQUE INDEX "quality_documents_product_type_id_year_version_number_key"
ON "quality_documents"("product_type_id", "year", "version_number");

CREATE INDEX "quality_documents_product_type_id_idx" ON "quality_documents"("product_type_id");

ALTER TABLE "quality_documents"
ADD CONSTRAINT "quality_documents_product_type_id_fkey"
FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "certificate_requests" ADD COLUMN "product_type_id" INTEGER;

UPDATE "certificate_requests"
SET "product_type_id" = (SELECT "id" FROM "product_types" WHERE "code" = 'CHAPA' LIMIT 1);

ALTER TABLE "certificate_requests" ALTER COLUMN "product_type_id" SET NOT NULL;

CREATE INDEX "certificate_requests_product_type_id_idx" ON "certificate_requests"("product_type_id");

ALTER TABLE "certificate_requests"
ADD CONSTRAINT "certificate_requests_product_type_id_fkey"
FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
