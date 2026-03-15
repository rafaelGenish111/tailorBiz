import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect if running as installed PWA (standalone mode)
 */
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const check = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);
    };

    check();

    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', check);
    return () => mql.removeEventListener('change', check);
  }, []);

  return isStandalone;
}

/**
 * Hook to manage the PWA install prompt
 * Only shows in admin area when not already installed
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const val = localStorage.getItem('pwa-install-dismissed');
      if (!val) return false;
      // Allow re-prompting after 7 days
      const dismissedAt = parseInt(val, 10);
      return Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });
  const isStandalone = useIsStandalone();

  useEffect(() => {
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem('pwa-install-dismissed', String(Date.now()));
    } catch {
      // ignore
    }
  }, []);

  return {
    canInstall: canInstall && !dismissed && !isStandalone,
    install,
    dismiss,
    isStandalone,
  };
}
