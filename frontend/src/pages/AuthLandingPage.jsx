import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  BadgeCheck,
  PhoneCall,
  Lock,
  ArrowRight,
  Zap,
  KeyRound,
  Building2,
  FileText,
  MapPin,
  Cpu,
  CheckCircle2,
  Smartphone,
  Radio,
  Navigation,
  Eye
} from 'lucide-react';

export default function AuthLandingPage() {
  const navigate = useNavigate();

  // Active Role Tab: 'citizen' | 'officer' | 'field_officer'
  const [selectedRole, setSelectedRole] = useState('field_officer');

  // Citizen Login State
  const [citizenMobile, setCitizenMobile] = useState('');
  const [citizenOtp, setCitizenOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // C2 Command Officer Login State
  const [officerBadge, setOfficerBadge] = useState('DL-CYBER-8842');
  const [officerUnit, setOfficerUnit] = useState('Special Cyber Cell, Delhi');
  const [officerPin, setOfficerPin] = useState('••••••');

  // Field Officer Login State
  const [fieldBadge, setFieldBadge] = useState('DL-PATROL-04');
  const [fieldUnit, setFieldUnit] = useState('Rohini Sector 14 Patrol');
  const [fieldPin, setFieldPin] = useState('••••••');

  const handleSendOtp = () => {
    setOtpSent(true);
    setCitizenOtp('782910'); // Simulated instant OTP for convenience
  };

  const handleCitizenLogin = (e) => {
    if (e) e.preventDefault();
    navigate('/ncrp-portal');
  };

  const handleOfficerLogin = (e) => {
    if (e) e.preventDefault();
    navigate('/dashboard');
  };

  const handleFieldOfficerLogin = (e) => {
    if (e) e.preventDefault();
    navigate('/field-officer');
  };

  const handleQuickOfficerRole = (badge, unit) => {
    setOfficerBadge(badge);
    setOfficerUnit(unit);
    setOfficerPin('••••••');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 20px 48px',
      maxWidth: '1360px',
      margin: '0 auto',
      width: '100%'
    }}>
      
      {/* 1. Master Portal Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '780px' }}>
        
        {/* Tricolor Accent Bar */}
        <div style={{
          width: '70px',
          height: '4px',
          background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)',
          borderRadius: '4px',
          margin: '0 auto 16px'
        }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#040914'
          }}>
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '0.04em', fontFamily: 'var(--font-display)' }}>
            TRINETRA • UNIFIED AUTHENTICATION GATEWAY
          </span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 8px', letterSpacing: '-0.02em' }}>
          Select Your Access Portal
        </h1>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
          Centralized secure entry for citizens filing NCRP complaints, Law Enforcement Officers accessing predictive command intelligence, and Field Patrol Officers on active surveillance.
        </p>
      </div>

      {/* 2. Triple Role Selection Cards (Citizen vs Command Center vs Field Officer) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1280px'
      }}>

        {/* ========================================================================= */}
        {/* CARD 1: CITIZEN ACCESS PORTAL */}
        {/* ========================================================================= */}
        <div
          onClick={() => setSelectedRole('citizen')}
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            border: selectedRole === 'citizen' ? '2px solid #00e5ff' : '1px solid var(--border-glass)',
            boxShadow: selectedRole === 'citizen' ? '0 0 30px rgba(0, 229, 255, 0.25)' : 'none',
            background: selectedRole === 'citizen' ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(13, 20, 36, 0.95) 100%)' : 'var(--bg-card)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00e5ff 0%, #0077ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#040914',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)'
              }}>
                <User size={24} strokeWidth={2.5} />
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#00e5ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Public Portal
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Citizen Access
                </h2>
              </div>
            </div>

            <span className="pulse-badge primary" style={{ fontSize: '0.65rem' }}>
              NCRP 1930
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Report online fraud, suspect UPI transfers, track complaint FIR status, or verify suspicious callers.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Lodge instant cybercrime complaint</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Track 1930 bank lien freeze status</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Mobile OTP Auth (No password)</span>
            </div>
          </div>

          {/* Citizen Login Form */}
          <form onSubmit={handleCitizenLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Mobile Number or Email
              </label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  value={citizenMobile}
                  onChange={(e) => setCitizenMobile(e.target.value)}
                  placeholder="+91-98765-43210"
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '9px 12px 9px 36px', borderRadius: '8px' }}
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  6-Digit OTP (Simulated: 782910)
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} color="#00e676" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="text"
                    value={citizenOtp}
                    onChange={(e) => setCitizenOtp(e.target.value)}
                    placeholder="782910"
                    className="cyber-input"
                    style={{ width: '100%', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '9px 12px 9px 36px', borderRadius: '8px', color: '#00e676' }}
                  />
                </div>
              </div>
            )}

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="cyber-btn cyber-btn-secondary"
                style={{ fontSize: '0.8rem', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Zap size={14} color="#00e5ff" />
                <span>Send OTP (Verify)</span>
              </button>
            ) : (
              <button
                type="submit"
                className="cyber-btn"
                style={{ fontSize: '0.86rem', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={handleCitizenLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00e5ff',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '2px',
                textDecoration: 'underline'
              }}
            >
              Direct Demo Access &rarr; Citizen Portal
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: FIELD OFFICER PORTAL (NEW ROLE) */}
        {/* ========================================================================= */}
        <div
          onClick={() => setSelectedRole('field_officer')}
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            border: selectedRole === 'field_officer' ? '2px solid #00e676' : '1px solid var(--border-glass)',
            boxShadow: selectedRole === 'field_officer' ? '0 0 30px rgba(0, 230, 118, 0.25)' : 'none',
            background: selectedRole === 'field_officer' ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.06) 0%, rgba(13, 20, 36, 0.95) 100%)' : 'var(--bg-card)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#040914',
                boxShadow: '0 0 16px rgba(0, 230, 118, 0.4)'
              }}>
                <Radio size={24} strokeWidth={2.5} />
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#00e676', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  On-Ground Tactical Response
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Field Officer Portal
                </h2>
              </div>
            </div>

            <span className="pulse-badge success" style={{ fontSize: '0.65rem', background: 'rgba(0,230,118,0.15)', color: '#00e676', border: '1px solid rgba(0,230,118,0.4)' }}>
              TACTICAL
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Mobile PWA for patrol officers. Real-time ATM cash-out interception alerts, victim Golden Window timers, and location dispatch.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Real-time ATM cash-out dispatch alerts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Victim Golden Window time countdown</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Mobile PWA offline mode support</span>
            </div>
          </div>

          {/* Field Officer Form */}
          <form onSubmit={handleFieldOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Officer Badge ID
                </label>
                <input
                  type="text"
                  value={fieldBadge}
                  onChange={(e) => setFieldBadge(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', padding: '9px 10px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Patrol Sector
                </label>
                <input
                  type="text"
                  value={fieldUnit}
                  onChange={(e) => setFieldUnit(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '9px 10px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Tactical Security PIN
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="password"
                  value={fieldPin}
                  onChange={(e) => setFieldPin(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '9px 12px 9px 36px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="cyber-btn"
              style={{
                fontSize: '0.86rem',
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
                boxShadow: '0 0 20px rgba(0, 230, 118, 0.35)',
                color: '#040914',
                fontWeight: 800
              }}
            >
              <Navigation size={16} />
              <span>Login to Field Officer Portal</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={handleFieldOfficerLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00e676',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '2px',
                textDecoration: 'underline'
              }}
            >
              Direct Demo Access &rarr; Field Officer Portal
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: LAW ENFORCEMENT COMMAND & CONTROL (C2) PORTAL */}
        {/* ========================================================================= */}
        <div
          onClick={() => setSelectedRole('officer')}
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            border: selectedRole === 'officer' ? '2px solid #a855f7' : '1px solid var(--border-glass)',
            boxShadow: selectedRole === 'officer' ? '0 0 30px rgba(168, 85, 247, 0.25)' : 'none',
            background: selectedRole === 'officer' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(13, 20, 36, 0.95) 100%)' : 'var(--bg-card)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.25s ease'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)'
              }}>
                <BadgeCheck size={24} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Law Enforcement HQ
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Command & Control
                </h2>
              </div>
            </div>

            <span className="pulse-badge danger" style={{ fontSize: '0.65rem' }}>
              RESTRICTED
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Full Trinetra C2 Center, GIS Hotspot Heatmaps, ATM cash-out ML models, and Neo4j Mule Graph analysis.
          </p>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '2px' }}>
              Preset:
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickOfficerRole('DL-CYBER-8842', 'Special Cyber Cell HQ');
              }}
              className="interactive-chip"
              style={{ fontSize: '0.68rem', padding: '3px 8px' }}
            >
              🕵️ Cyber Investigator
            </button>
          </div>

          {/* Officer Login Form */}
          <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Badge ID
                </label>
                <input
                  type="text"
                  value={officerBadge}
                  onChange={(e) => setOfficerBadge(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', padding: '9px 10px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Assigned Unit
                </label>
                <input
                  type="text"
                  value={officerUnit}
                  onChange={(e) => setOfficerUnit(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '9px 10px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Security PIN
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="password"
                  value={officerPin}
                  onChange={(e) => setOfficerPin(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '9px 12px 9px 36px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="cyber-btn"
              style={{
                fontSize: '0.86rem',
                padding: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.35)'
              }}
            >
              <Cpu size={16} />
              <span>Login to Trinetra C2 Center</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={handleOfficerLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c084fc',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '2px',
                textDecoration: 'underline'
              }}
            >
              Direct Demo Access &rarr; Trinetra C2 Center
            </button>
          </form>
        </div>

      </div>

      {/* 3. Bottom Trust & Security Telemetry Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        marginTop: '36px',
        fontSize: '0.76rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PhoneCall size={14} color="#ff385c" />
          <span>National Helpline: <strong style={{ color: '#fff' }}>1930</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#00e676" />
          <span>MHA / I4C CFCFRMS Integrated Node</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={14} color="#00e5ff" />
          <span>256-Bit TLS End-to-End Cryptography</span>
        </div>
      </div>

    </div>
  );
}
