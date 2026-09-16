import { env } from '../config/env.js';

/** Origem dos arquivos estáticos (sem `/api`). */
function filesBaseUrl(): string {
  return env.URL_VERIFY_EMPLOYEES.replace(/\/api\/?$/, '');
}

/**
 * Converte `path` da API de peças em URL exibível no browser.
 * Ex.: `uploads\temp\fabricacao\foo.png` → `http://host:8886/uploads/temp/fabricacao/foo.png`
 */
export function resolvePartImageUrl(imagePath: string): string {
  const trimmed = imagePath.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^(https?:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.replace(/\\/g, '/').replace(/^\//, '');
  return `${filesBaseUrl()}/${normalized}`;
}
