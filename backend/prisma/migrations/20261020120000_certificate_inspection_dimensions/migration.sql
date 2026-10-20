-- Split legacy dimensional fields (e.g. 12,50X1,200X3,000) into thickness, width and length.

ALTER TABLE "certificate_inspections"
ADD COLUMN "dimensional_specified_thickness" TEXT,
ADD COLUMN "dimensional_specified_width" TEXT,
ADD COLUMN "dimensional_specified_length" TEXT,
ADD COLUMN "dimensional_found_thickness" TEXT,
ADD COLUMN "dimensional_found_width" TEXT,
ADD COLUMN "dimensional_found_length" TEXT;

UPDATE "certificate_inspections"
SET
  "dimensional_specified_thickness" = CASE
    WHEN "dimensional_specified" ~ '[Xx]' THEN trim((regexp_split_to_array("dimensional_specified", '[Xx]'))[1])
    ELSE trim("dimensional_specified")
  END,
  "dimensional_specified_width" = CASE
    WHEN "dimensional_specified" ~ '[Xx]' THEN COALESCE(trim((regexp_split_to_array("dimensional_specified", '[Xx]'))[2]), '')
    ELSE ''
  END,
  "dimensional_specified_length" = CASE
    WHEN "dimensional_specified" ~ '[Xx]' THEN COALESCE(trim((regexp_split_to_array("dimensional_specified", '[Xx]'))[3]), '')
    ELSE ''
  END,
  "dimensional_found_thickness" = CASE
    WHEN "dimensional_found" ~ '[Xx]' THEN trim((regexp_split_to_array("dimensional_found", '[Xx]'))[1])
    ELSE trim("dimensional_found")
  END,
  "dimensional_found_width" = CASE
    WHEN "dimensional_found" ~ '[Xx]' THEN COALESCE(trim((regexp_split_to_array("dimensional_found", '[Xx]'))[2]), '')
    ELSE ''
  END,
  "dimensional_found_length" = CASE
    WHEN "dimensional_found" ~ '[Xx]' THEN COALESCE(trim((regexp_split_to_array("dimensional_found", '[Xx]'))[3]), '')
    ELSE ''
  END;

ALTER TABLE "certificate_inspections"
ALTER COLUMN "dimensional_specified_thickness" SET NOT NULL,
ALTER COLUMN "dimensional_specified_width" SET NOT NULL,
ALTER COLUMN "dimensional_specified_length" SET NOT NULL,
ALTER COLUMN "dimensional_found_thickness" SET NOT NULL,
ALTER COLUMN "dimensional_found_width" SET NOT NULL,
ALTER COLUMN "dimensional_found_length" SET NOT NULL;

ALTER TABLE "certificate_inspections"
DROP COLUMN "dimensional_specified",
DROP COLUMN "dimensional_found";
