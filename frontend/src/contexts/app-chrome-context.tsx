import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AppChromeContextValue = {
  hideHeader: boolean;
  setHideHeader: (hide: boolean) => void;
};

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function AppChromeProvider({ children }: { children: ReactNode }) {
  const [hideHeader, setHideHeader] = useState(false);

  const value = useMemo(
    () => ({ hideHeader, setHideHeader }),
    [hideHeader],
  );

  return (
    <AppChromeContext.Provider value={value}>{children}</AppChromeContext.Provider>
  );
}

export function useAppChrome() {
  const context = useContext(AppChromeContext);
  if (!context) {
    throw new Error('useAppChrome must be used within AppChromeProvider');
  }
  return context;
}
