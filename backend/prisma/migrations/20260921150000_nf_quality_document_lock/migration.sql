ALTER TABLE "certificate_requests"
ADD COLUMN "quality_document_id" TEXT;

ALTER TABLE "certificate_requests"
ADD CONSTRAINT "certificate_requests_quality_document_id_fkey"
FOREIGN KEY ("quality_document_id") REFERENCES "quality_documents"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "certificate_requests_quality_document_id_idx"
ON "certificate_requests"("quality_document_id");
