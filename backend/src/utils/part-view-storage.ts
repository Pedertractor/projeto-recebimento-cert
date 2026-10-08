import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'part-views');

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
]);

export function sanitizePartCode(partCode: string): string {
  return partCode.trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
}

export async function savePartViewImage(
  partCode: string,
  viewKind: string,
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg';
  const safePartCode = sanitizePartCode(partCode);
  const targetDir = path.join(UPLOADS_ROOT, safePartCode);

  await mkdir(targetDir, { recursive: true });

  const storedName = `${viewKind.toLowerCase()}-${randomUUID()}${safeExt}`;
  const absolutePath = path.join(targetDir, storedName);
  await writeFile(absolutePath, buffer);

  return `/uploads/part-views/${safePartCode}/${storedName}`;
}

export function getUploadsRoot(): string {
  return UPLOADS_ROOT;
}
