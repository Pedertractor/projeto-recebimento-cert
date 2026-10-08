import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'weld-defect-types');

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
]);

export function sanitizeDefectTypeCode(code: string): string {
  return code.trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
}

export async function saveWeldDefectTypeImage(
  defectTypeCode: string,
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.jpg';
  const safeCode = sanitizeDefectTypeCode(defectTypeCode);
  const targetDir = path.join(UPLOADS_ROOT, safeCode);

  await mkdir(targetDir, { recursive: true });

  const storedName = `${randomUUID()}${safeExt}`;
  const absolutePath = path.join(targetDir, storedName);
  await writeFile(absolutePath, buffer);

  return `/uploads/weld-defect-types/${safeCode}/${storedName}`;
}

export async function deleteWeldDefectTypeImage(
  publicPath: string,
): Promise<void> {
  const relativePath = publicPath.replace(/^\/uploads\//, '');
  const absolutePath = path.join(process.cwd(), 'uploads', relativePath);

  try {
    await unlink(absolutePath);
  } catch {
    // Ignore missing files on disk.
  }
}
