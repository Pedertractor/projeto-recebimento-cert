CREATE TABLE "quality_documents" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "version_number" INTEGER NOT NULL,
    "display_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "uploaded_by_user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "quality_documents_year_version_number_key" ON "quality_documents"("year", "version_number");

CREATE INDEX "quality_documents_year_idx" ON "quality_documents"("year");

ALTER TABLE "quality_documents" ADD CONSTRAINT "quality_documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
