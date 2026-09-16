import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

import { useWebSession } from '@/hooks/auth/use-web-session';
import {
  applyDocumentTheme,
  DEFAULT_ADMIN_THEME,
  readStoredAdminTheme,
  storeAdminTheme,
  type AdminTheme,
} from '@/lib/admin-theme';

type AdminThemeContextValue = {
  theme: AdminTheme;
  canToggleTheme: boolean;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

function resolveAdminTheme(): AdminTheme {
  return readStoredAdminTheme() ?? DEFAULT_ADMIN_THEME;
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { data: user } = useWebSession();
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isLoginRoute = pathname === '/login';
  const [theme, setThemeState] = useState<AdminTheme>(() =>
    readStoredAdminTheme() ?? 'light',
  );

  useEffect(() => {
    if (isLoginRoute || !user) {
      applyDocumentTheme('light');
      return;
    }

    if (!isSuperAdmin) {
      applyDocumentTheme('light');
      return;
    }

    const nextTheme = resolveAdminTheme();
    setThemeState(nextTheme);
    applyDocumentTheme(nextTheme);
  }, [isSuperAdmin, isLoginRoute, user]);

  const setTheme = useCallback(
    (nextTheme: AdminTheme) => {
      if (!isSuperAdmin) {
        return;
      }

      setThemeState(nextTheme);
      storeAdminTheme(nextTheme);
      applyDocumentTheme(nextTheme);
    },
    [isSuperAdmin],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      canToggleTheme: isSuperAdmin,
      setTheme,
      toggleTheme,
    }),
    [isSuperAdmin, setTheme, theme, toggleTheme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
}
