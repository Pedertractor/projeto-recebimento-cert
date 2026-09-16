export type AdminTheme = 'light' | 'dark';

export const ADMIN_THEME_STORAGE_KEY = 'certificado-qualidade-admin-theme';

/** Tema padrão para admins quando não há preferência salva. */
export const DEFAULT_ADMIN_THEME: AdminTheme = 'light';

export function readStoredAdminTheme(): AdminTheme | null {
  const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

export function storeAdminTheme(theme: AdminTheme) {
  localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
}

export function applyDocumentTheme(theme: AdminTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
