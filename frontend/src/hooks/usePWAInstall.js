import { useState, useEffect, useCallback } from 'react';

/**
 * Detect the user's platform for install guidance:
 *   'ios'     → iOS Safari (requires manual Add to Home Screen)
 *   'android' → Android Chrome/WebAPK (native install prompt available)
 *   'desktop' → Desktop Chrome/Edge (native install prompt available)
 *   'other'   → Firefox, Samsung Internet, etc.
 */
function detectPlatform() {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

/** Returns true if running in standalone / installed mode */
function isRunningStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * usePWAInstall — best-in-class PWA install hook
 *
 * Returns:
 *   canInstall    {boolean}  — native prompt is available (Chrome/Edge/Android)
 *   isInstalled   {boolean}  — app is already running as installed PWA
 *   platform      {string}   — 'android' | 'ios' | 'desktop' | 'other'
 *   triggerInstall{function} — call to fire the native install prompt
 *   installOutcome{string|null} — 'accepted' | 'dismissed' | null
 *   dismissModal  {function} — persistently dismiss the install nudge
 *   modalDismissed{boolean}  — user explicitly said "no thanks"
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isRunningStandalone());
  const [platform] = useState(detectPlatform);
  const [installOutcome, setInstallOutcome] = useState(null);
  const [modalDismissed, setModalDismissed] = useState(
    () => localStorage.getItem('trinetra_pwa_dismissed') === 'true'
  );

  // Capture the beforeinstallprompt event (Chrome, Edge, Android Chrome)
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Detect when the app is installed (appinstalled event)
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  // Also re-check standalone mode on display-mode change
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => setIsInstalled(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fire the native install prompt
  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallOutcome(outcome);
      setDeferredPrompt(null);
      setCanInstall(false);
      if (outcome === 'accepted') setIsInstalled(true);
      return outcome === 'accepted';
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Persistently dismiss the nudge
  const dismissModal = useCallback(() => {
    localStorage.setItem('trinetra_pwa_dismissed', 'true');
    setModalDismissed(true);
  }, []);

  // Reset dismiss if user manually uninstalls
  const resetDismiss = useCallback(() => {
    localStorage.removeItem('trinetra_pwa_dismissed');
    setModalDismissed(false);
  }, []);

  return {
    canInstall,
    isInstalled,
    platform,
    triggerInstall,
    installOutcome,
    modalDismissed,
    dismissModal,
    resetDismiss,
  };
}
