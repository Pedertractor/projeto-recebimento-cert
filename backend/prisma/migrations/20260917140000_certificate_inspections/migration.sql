-- CreateEnum
CREATE TYPE "attachment_validity" AS ENUM ('VALID', 'INVALID');

-- CreateEnum
CREATE TYPE "inspection_check_result" AS ENUM ('OK', 'NOK');

-- AlterEnum
ALTER TYPE "attachment_type" ADD VALUE 'IMPRESSAO_CONFERENCIA';

-- AlterEnum
ALTER TYPE "request_history_event_type" ADD VALUE 'CONFERENCIA_REALIZADA';

-- AlterEnum
ALTER TYPE "request_history_event_type" ADD VALUE 'CERTIFICADO_INVALIDADO';

-- AlterTable
ALTER TABLE "request_attachments" ADD COLUMN "lot_index" INTEGER;
ALTER TABLE "request_attachments" ADD COLUMN "validity" "attachment_validity" NOT NULL DEFAULT 'VALID';

-- CreateTable
CREATE TABLE "certificate_inspections" (
    "id" TEXT NOT NULL,
    "attachment_id" TEXT NOT NULL,
    "request_id" INTEGER NOT NULL,
    "quality_document_id" TEXT NOT NULL,
    "receipt_date" DATE NOT NULL,
    "material_description" TEXT NOT NULL,
    "rm" TEXT NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "chemical_composition" "inspection_check_result" NOT NULL,
    "quantity_specified" TEXT NOT NULL,
    "quantity_found" TEXT NOT NULL,
    "dimensional_specified" TEXT NOT NULL,
    "dimensional_found" TEXT NOT NULL,
    "visual_inspection" "inspection_check_result" NOT NULL,
    "report_status" "inspection_check_result" NOT NULL,
    "receiver_responsible" TEXT NOT NULL,
    "inspected_by_user_id" INTEGER NOT NULL,
    "inspected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_inspections_attachment_id_key" ON "certificate_inspections"("attachment_id");

-- CreateIndex
CREATE INDEX "certificate_inspections_request_id_idx" ON "certificate_inspections"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "request_attachments_request_id_lot_index_type_key" ON "request_attachments"("request_id", "lot_index", "type");

-- AddForeignKey
ALTER TABLE "certificate_inspections" ADD CONSTRAINT "certificate_inspections_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "request_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_inspections" ADD CONSTRAINT "certificate_inspections_quality_document_id_fkey" FOREIGN KEY ("quality_document_id") REFERENCES "quality_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_inspections" ADD CONSTRAINT "certificate_inspections_inspected_by_user_id_fkey" FOREIGN KEY ("inspected_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
