export const PWA_INSTALL_DISMISSED_KEY = 'batalha-naval-pwa-install-dismissed';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const mediaStandalone = window.matchMedia(
    '(display-mode: standalone)',
  ).matches;
  const iosStandalone =
    'standalone' in window.navigator &&
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    );

  return mediaStandalone || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  const isIpadOs =
    window.navigator.platform === 'MacIntel' &&
    window.navigator.maxTouchPoints > 1;

  return isIos || isIpadOs;
}

export function hasDismissedInstallPrompt(): boolean {
  try {
    return window.localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markInstallPromptDismissed() {
  try {
    window.localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}
