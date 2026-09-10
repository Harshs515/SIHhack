import React, { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import PWAInstallModal from './PWAInstallModal';

// ────────────────────────────────────────────────────────────
// Offline Banner
// ────────────────────────────────────────────────────────────
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
      color: '#fff', textAlign: 'center', padding: '8px 16px',
      fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      fontFamily: 'var(--font-mono, monospace)',
      boxShadow: '0 2px 20px rgba(255,107,53,0.5)',
      animation: 'slideDown 0.3s ease',
    }}>
      <span style={{ fontSize: '1rem' }}>⚡</span>
      OFFLINE MODE — Cached data displayed. Reconnect to sync live intelligence.
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SW Update Toast
// ────────────────────────────────────────────────────────────
function UpdateToast({ onUpdate }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '88px', right: '24px', zIndex: 9998,
      background: 'linear-gradient(135deg, rgba(10,16,30,0.98) 0%, rgba(0,60,80,0.98) 100%)',
      border: '1px solid rgba(0,229,255,0.3)',
      borderRadius: '16px', padding: '16px 20px',
      boxShadow: '0 8px 40px rgba(0,229,255,0.2), 0 0 0 1px rgba(0,229,255,0.1)',
      backdropFilter: 'blur(20px)',
      maxWidth: '320px',
      animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #00e5ff, #3a7bd5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>🔄</div>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem', marginBottom: '2px' }}>
            Update Available
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
            A new version of TRINETRA is ready.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={onUpdate}
          style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #00e5ff, #3a7bd5)',
            color: '#040914', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
          }}
        >Reload & Update</button>
        <button
          onClick={() => setVisible(false)}
          style={{
            padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem',
          }}
        >Later</button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PWA Provider
// ────────────────────────────────────────────────────────────
export default function PWAProvider({ children }) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service Worker registered:', r);
    },
    onRegisterError(err) {
      console.warn('[PWA] Service Worker registration error:', err);
    },
    onOfflineReady() {
      console.log('[PWA] App ready for offline use');
    },
  });

  const handleUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  return (
    <>
      <OfflineBanner />
      {needRefresh && <UpdateToast onUpdate={handleUpdate} />}
      {children}
      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  );
}
