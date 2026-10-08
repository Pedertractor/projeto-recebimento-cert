import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'quality-documents');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

export async function saveQualityDocumentFile(
  year: number,
  versionNumber: number,
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.pdf';
  const targetDir = path.join(UPLOADS_ROOT, String(year), `v${versionNumber}`);

  await mkdir(targetDir, { recursive: true });

  const storedName = `${randomUUID()}${safeExt}`;
  const absolutePath = path.join(targetDir, storedName);
  await writeFile(absolutePath, buffer);

  return `/uploads/quality-documents/${year}/v${versionNumber}/${storedName}`;
}

export function buildQualityDocumentDisplayName(
  year: number,
  versionNumber: number,
): string {
  return `DOC QUALIDADE ${year} v${versionNumber}`;
}
