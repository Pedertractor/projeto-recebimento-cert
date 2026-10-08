import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { AppError } from '../lib/errors.js';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'suppliers');
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export async function saveSupplierLogo(
  supplierId: number,
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  if (buffer.length > MAX_LOGO_BYTES) {
    throw new AppError('A logo deve ter no máximo 2 MB.');
  }

  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.png';
  const targetDir = path.join(UPLOADS_ROOT, String(supplierId));

  await mkdir(targetDir, { recursive: true });

  const storedName = `${randomUUID()}${safeExt}`;
  const absolutePath = path.join(targetDir, storedName);
  await writeFile(absolutePath, buffer);

  return `/uploads/suppliers/${supplierId}/${storedName}`;
}

export async function deleteSupplierLogo(publicPath: string): Promise<void> {
  const relativePath = publicPath.replace(/^\/uploads\//, '');
  const absolutePath = path.join(process.cwd(), 'uploads', relativePath);

  try {
    await unlink(absolutePath);
  } catch {
    // Ignore missing files on disk.
  }
}
