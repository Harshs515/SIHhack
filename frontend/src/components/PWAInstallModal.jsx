import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

// ────────────────────────────────────────────────────────────
// Tab data
// ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
  { id: 'desktop', label: 'Desktop' },
];

// ────────────────────────────────────────────────────────────
// Step component
// ────────────────────────────────────────────────────────────
function Step({ number, icon, title, description }) {
  return (
    <div style={{
      display: 'flex', gap: '14px', alignItems: 'flex-start',
      padding: '14px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(58,123,213,0.2) 100%)',
        border: '1px solid rgba(0,229,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem',
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e5ff, #3a7bd5)',
            color: '#040914', fontSize: '0.65rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{number}</span>
          <span style={{ color: '#e0f7fa', fontWeight: 600, fontSize: '0.85rem' }}>{title}</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Android Tab
// ────────────────────────────────────────────────────────────
function AndroidTab({ canInstall, onInstall }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(58,123,213,0.08))',
        border: '1px solid rgba(0,229,255,0.2)', borderRadius: '12px',
        padding: '14px 16px', marginBottom: '4px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚡</span>
        <div>
          <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.82rem' }}>One-tap install available!</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            {canInstall
              ? 'Your browser supports native install. Click the button below.'
              : 'Open this page in Chrome on Android for the best experience.'}
          </div>
        </div>
      </div>

      {canInstall ? (
        <button
          onClick={onInstall}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
            color: '#040914', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 24px rgba(0,229,255,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,229,255,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,229,255,0.35)'; }}
        >
          <span style={{ fontSize: '1.1rem' }}>📲</span>
          Install TRINETRA App
        </button>
      ) : (
        <>
          <Step number={1} icon="🌐" title="Open in Chrome"
            description="Make sure you're using Google Chrome on your Android device — it's the recommended browser for TRINETRA." />
          <Step number={2} icon="⋮" title='Tap the "⋮" Menu'
            description='Tap the three-dot menu in the top-right corner of Chrome.' />
          <Step number={3} icon="📲" title='"Add to Home screen"'
            description='Select "Add to Home screen" from the dropdown menu.' />
          <Step number={4} icon="✅" title="Confirm Installation"
            description='Tap "Add" in the confirmation dialog. TRINETRA will appear on your home screen like a native app.' />
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// iOS Tab
// ────────────────────────────────────────────────────────────
function IOSTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,149,0,0.08), rgba(255,59,48,0.08))',
        border: '1px solid rgba(255,149,0,0.25)', borderRadius: '12px',
        padding: '14px 16px', marginBottom: '4px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
        <div>
          <div style={{ color: '#ff9500', fontWeight: 700, fontSize: '0.82rem' }}>iOS requires manual steps</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            Apple doesn't allow install prompts. Follow these steps in Safari.
          </div>
        </div>
      </div>

      <Step number={1} icon="🧭" title="Open in Safari"
        description="TRINETRA must be installed from Safari on iPhone or iPad. If you're in another browser, copy the URL and open it in Safari." />
      <Step number={2} icon="⬆️" title='Tap the Share Button'
        description='Tap the Share icon (square with upward arrow) at the bottom of the Safari browser.' />
      <Step number={3} icon="🏠" title='"Add to Home Screen"'
        description='Scroll down in the Share sheet and tap "Add to Home Screen".' />
      <Step number={4} icon="✏️" title="Name & Confirm"
        description='You can rename the app. Tap "Add" in the top-right corner to install TRINETRA on your home screen.' />
      <Step number={5} icon="🚀" title="Launch Like a Native App"
        description='TRINETRA will open in full-screen mode without the Safari browser bar, just like a native iOS app.' />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Desktop Tab
// ────────────────────────────────────────────────────────────
function DesktopTab({ canInstall, onInstall }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px',
        padding: '14px 16px', marginBottom: '4px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '1.5rem' }}>💻</span>
        <div>
          <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.82rem' }}>
            {canInstall ? 'Ready to install on your desktop!' : 'Chrome or Edge recommended'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
            {canInstall
              ? 'Click the button below to install TRINETRA as a desktop app.'
              : 'Use Google Chrome or Microsoft Edge for the best installation experience.'}
          </div>
        </div>
      </div>

      {canInstall ? (
        <button
          onClick={onInstall}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.4)'; }}
        >
          <span style={{ fontSize: '1.1rem' }}>🖥️</span>
          Install TRINETRA on Desktop
        </button>
      ) : (
        <>
          <Step number={1} icon="🌐" title="Open in Chrome or Edge"
            description="Navigate to TRINETRA in Google Chrome or Microsoft Edge on your Windows, Mac, or Linux computer." />
          <Step number={2} icon="📍" title="Click the Install Icon"
            description='Look for the install icon (⊕ or computer icon) in the browser address bar on the right side.' />
          <Step number={3} icon="⬇️" title="Click Install"
            description='A dialog will appear. Click "Install" to confirm. TRINETRA will open in its own dedicated window.' />
          <Step number={4} icon="📌" title="Pin to Taskbar (Optional)"
            description='Right-click the TRINETRA icon in your taskbar and select "Pin to taskbar" for quick access.' />
        </>
      )}

      <div style={{
        marginTop: '4px', padding: '12px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', lineHeight: 1.5 }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Works offline:</strong> TRINETRA uses a service worker to cache all assets. Once installed, the app loads instantly even without an internet connection.
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Modal
// ────────────────────────────────────────────────────────────
export default function PWAInstallModal({ isOpen, onClose, defaultTab }) {
  const { canInstall, platform, triggerInstall, dismissModal } = usePWAInstall();
  const [activeTab, setActiveTab] = useState(defaultTab || platform || 'android');
  const [installing, setInstalling] = useState(false);

  // Sync active tab if default changes
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
    else if (platform) setActiveTab(platform === 'other' ? 'desktop' : platform);
  }, [defaultTab, platform]);

  if (!isOpen) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await triggerInstall();
    setInstalling(false);
    onClose();
  };

  const handleDismiss = () => {
    dismissModal();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(4,9,20,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.25s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', zIndex: 10001,
          transform: 'translate(-50%, -50%)',
          width: 'min(480px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, rgba(10,16,30,0.99) 0%, rgba(4,15,30,0.99) 100%)',
          border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0,
              boxShadow: '0 0 24px rgba(0,229,255,0.4)',
            }}>🛡️</div>
            <div>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                Install TRINETRA
              </h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: '2px' }}>
                Get the full native app experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close install modal"
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >✕</button>
        </div>



        {/* Platform Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
          padding: '4px', marginBottom: '20px', gap: '4px',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '9px 6px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.78rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, rgba(0,229,255,0.18) 0%, rgba(58,123,213,0.18) 100%)'
                  : 'transparent',
                color: activeTab === tab.id ? '#00e5ff' : 'rgba(255,255,255,0.45)',
                boxShadow: activeTab === tab.id ? '0 0 0 1px rgba(0,229,255,0.3)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>{tab.emoji}</span>
              {tab.label}
              {tab.id === (platform === 'other' ? 'desktop' : platform) && (
                <span style={{
                  fontSize: '0.55rem', padding: '2px 5px', borderRadius: '4px',
                  background: 'rgba(0,229,255,0.15)', color: '#00e5ff', fontWeight: 800,
                }}>YOU</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '200px' }}>
          {activeTab === 'android' && (
            <AndroidTab canInstall={canInstall && platform === 'android'} onInstall={handleInstall} />
          )}
          {activeTab === 'ios' && <IOSTab />}
          {activeTab === 'desktop' && (
            <DesktopTab canInstall={canInstall && platform === 'desktop'} onInstall={handleInstall} />
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
              color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            Don't show again
          </button>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem' }}>
            Free · No account required
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
