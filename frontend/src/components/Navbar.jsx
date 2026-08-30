import React, { useState, useEffect } from 'react';
import {
  Shield,
  Radio,
  RefreshCw,
  Bell,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Globe2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isRunningML, onTriggerML, activeAlertsCount = 2 }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickJump, setShowQuickJump] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const QUICK_LINKS = [
    { title: 'Command Center', path: '/' },
    { title: 'GIS Risk Heatmap', path: '/gis-heatmap' },
    { title: 'Predictive AI Engine (XGBoost & SHAP)', path: '/predictive-analytics' },
    { title: 'Mule Chain Graph Explorer', path: '/mule-graph' },
    { title: 'Police & LEA Dispatch', path: '/lea-interface' },
    { title: 'Real-Time Alerts Hub', path: '/alerts-center' },
    { title: 'NCRP Complaint Triage (1930)', path: '/ncrp-complaints' },
    { title: 'Analytics & Reports', path: '/analytics-reports' },
    { title: 'Pipeline Topology', path: '/pipeline-topology' }
  ];

  const filteredLinks = QUICK_LINKS.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectLink = (path) => {
    navigate(path);
    setShowQuickJump(false);
    setSearchQuery('');
  };

  return (
    <header className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', zIndex: 1000 }}>
      {/* Left: Platform Name (Desi + English) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#040914',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)'
          }}>
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff 10%, #00e5ff 70%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                TRINETRA CyberDrishti
              </h1>
              <span className="pulse-badge primary" style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                PROACTIVE AI
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>National Cyber Security & Mule-Chain Interceptor Command</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <span style={{ color: '#00e5ff' }}>I4C / Ministry of Home Affairs</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Middle: Interactive Quick Jump Command Search */}
      <div style={{ position: 'relative', width: '300px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--border-glass-bright)',
          borderRadius: '20px',
          padding: '4px 12px',
          gap: '8px'
        }}>
          <Search size={14} color="#00e5ff" />
          <input
            type="text"
            placeholder="Quick Jump / Search Module..."
            value={searchQuery}
            onFocus={() => setShowQuickJump(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.78rem',
              outline: 'none',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          <kbd style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '1px 5px', borderRadius: '4px' }}>
            Ctrl+K
          </kbd>
        </div>

        {/* Search Results Dropdown */}
        {showQuickJump && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '38px',
              left: 0,
              right: 0,
              padding: '6px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.8)'
            }}
          >
            {filteredLinks.map((link, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectLink(link.path)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <span>{link.title}</span>
                <span style={{ fontSize: '0.65rem', color: '#00e5ff' }}>&rarr;</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Sound Alert, IST Clock & Trigger AI Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Audio Alert Toggle */}
        <button
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          title={isAudioEnabled ? 'Live Siren Audio Enabled' : 'Live Siren Audio Muted'}
          style={{
            background: isAudioEnabled ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${isAudioEnabled ? 'rgba(0, 229, 255, 0.3)' : 'var(--border-glass)'}`,
            color: isAudioEnabled ? '#00e5ff' : 'var(--text-muted)',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Satellite Sync & Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-glass)',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '0.74rem'
        }}>
          <Globe2 size={13} color="#00e676" />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            IST {time}
          </span>
        </div>

        {/* Global Trigger Spatial ML Button */}
        <button
          onClick={onTriggerML}
          disabled={isRunningML}
          className="cyber-btn"
          style={{
            padding: '7px 14px',
            fontSize: '0.78rem',
            cursor: isRunningML ? 'not-allowed' : 'pointer',
            opacity: isRunningML ? 0.75 : 1
          }}
        >
          <RefreshCw size={13} style={{ animation: isRunningML ? 'spin 1s linear infinite' : 'none' }} />
          {isRunningML ? 'Calculating Risk...' : 'Run Spatial AI'}
        </button>

        {/* Alerts Bell Link */}
        <Link
          to="/alerts-center"
          title="Real-Time Alert Broadcasts"
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Bell size={17} />
          {activeAlertsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ff385c',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(255, 56, 92, 0.7)'
            }}>
              {activeAlertsCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
