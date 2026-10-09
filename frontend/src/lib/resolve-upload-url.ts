import { env } from '@/config/env';

/**
 * Origem pública do backend, sem `/api`.
 * Com API no mesmo host (`/api` no dev ou no nginx), devolve null e o caminho fica relativo.
 */
function uploadsOrigin(): string | null {
  const apiUrl = env.apiUrl.trim().replace(/\/$/, '');
  if (!apiUrl || apiUrl.startsWith('/')) {
    return null;
  }

  return apiUrl.replace(/\/api$/, '');
}

/**
 * Monta a URL de arquivos em `/uploads/` servidos pelo backend.
 * Ex.: `/uploads/suppliers/2/logo.jpg` → `http://host:3000/uploads/suppliers/2/logo.jpg`
 * quando `VITE_API_URL` aponta para outro host.
 */
export function resolveUploadUrl(imagePath: string | null): string | null {
  if (!imagePath) {
    return null;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\\/g, '/');
  const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  if (!withSlash.startsWith('/uploads/')) {
    return trimmed;
  }

  const origin = uploadsOrigin();
  if (!origin) {
    return withSlash;
  }

  return `${origin}${withSlash}`;
}
