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
  Eye
} from 'lucide-react';

export default function AuthLandingPage() {
  const navigate = useNavigate();

  // Active Role Tab: 'citizen' or 'officer'
  const [selectedRole, setSelectedRole] = useState('citizen'); // 'citizen' | 'officer'

  // Citizen Login State
  const [citizenMobile, setCitizenMobile] = useState('');
  const [citizenOtp, setCitizenOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Officer Login State
  const [officerBadge, setOfficerBadge] = useState('DL-CYBER-8842');
  const [officerUnit, setOfficerUnit] = useState('Special Cyber Cell, Delhi');
  const [officerPin, setOfficerPin] = useState('••••••');

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
      maxWidth: '1280px',
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
          Centralized secure entry for citizens filing NCRP complaints and Law Enforcement Officers accessing real-time predictive intelligence.
        </p>
      </div>

      {/* 2. Dual Role Selection Cards (Citizen vs Field Officer) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        width: '100%',
        maxWidth: '1040px'
      }}>

        {/* ========================================================================= */}
        {/* CARD 1: CITIZEN ACCESS PORTAL */}
        {/* ========================================================================= */}
        <div
          onClick={() => setSelectedRole('citizen')}
          className="glass-panel"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00e5ff 0%, #0077ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#040914',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)'
              }}>
                <User size={26} strokeWidth={2.5} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#00e5ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Public Portal
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Citizen Access
                </h2>
              </div>
            </div>

            <span className="pulse-badge primary" style={{ fontSize: '0.68rem' }}>
              NCRP 1930
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Report online fraud, suspect UPI / bank transfers, track complaint FIR status, or verify suspicious callers.
          </p>

          {/* Citizen Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Lodge instant cybercrime complaint</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>Track 1930 bank lien freeze & status</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color="#00e676" />
              <span>No password required (Mobile OTP auth)</span>
            </div>
          </div>

          {/* Citizen Login Form */}
          <form onSubmit={handleCitizenLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Mobile Number or Email ID
              </label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={citizenMobile}
                  onChange={(e) => setCitizenMobile(e.target.value)}
                  placeholder="+91-98765-43210"
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.9rem', padding: '10px 12px 10px 38px', borderRadius: '8px' }}
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Enter 6-Digit OTP (Simulated: 782910)
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="#00e676" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="text"
                    value={citizenOtp}
                    onChange={(e) => setCitizenOtp(e.target.value)}
                    placeholder="782910"
                    className="cyber-input"
                    style={{ width: '100%', fontSize: '0.95rem', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '10px 12px 10px 38px', borderRadius: '8px', color: '#00e676' }}
                  />
                </div>
              </div>
            )}

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="cyber-btn cyber-btn-secondary"
                style={{ fontSize: '0.82rem', padding: '10px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Zap size={14} color="#00e5ff" />
                <span>Send OTP (One-Click Verification)</span>
              </button>
            ) : (
              <button
                type="submit"
                className="cyber-btn"
                style={{ fontSize: '0.9rem', padding: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Enter NCRP Citizen Portal</span>
                <ArrowRight size={16} />
              </button>
            )}

            {/* Direct Quick Bypass Button */}
            <button
              type="button"
              onClick={handleCitizenLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00e5ff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '4px',
                textDecoration: 'underline'
              }}
            >
              Direct Demo Access &rarr; Open Citizen Portal
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: LAW ENFORCEMENT & FIELD OFFICER PORTAL */}
        {/* ========================================================================= */}
        <div
          onClick={() => setSelectedRole('officer')}
          className="glass-panel"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)'
              }}>
                <BadgeCheck size={28} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Law Enforcement Agency
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Field & LEA Officer
                </h2>
              </div>
            </div>

            <span className="pulse-badge danger" style={{ fontSize: '0.68rem' }}>
              RESTRICTED
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Access Trinetra Command & Control, GIS Hotspot Heatmaps, ATM cash-out predictions, and Neo4j Mule Chain graphs.
          </p>

          {/* Quick Demo Role Presets */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
              Quick Credentials:
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickOfficerRole('DL-PATROL-04', 'Rohini Sector 14 Patrol');
              }}
              className="interactive-chip"
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              🚓 Field Patrol
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQuickOfficerRole('DL-CYBER-8842', 'Special Cyber Cell HQ');
              }}
              className="interactive-chip"
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              🕵️ Cyber Investigator
            </button>
          </div>

          {/* Officer Login Form */}
          <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Officer Badge ID
                </label>
                <input
                  type="text"
                  value={officerBadge}
                  onChange={(e) => setOfficerBadge(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.86rem', fontFamily: 'var(--font-mono)', padding: '10px 12px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Assigned Unit
                </label>
                <input
                  type="text"
                  value={officerUnit}
                  onChange={(e) => setOfficerUnit(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.86rem', padding: '10px 12px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Tactical Security PIN
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  value={officerPin}
                  onChange={(e) => setOfficerPin(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', fontSize: '0.9rem', padding: '10px 12px 10px 38px', borderRadius: '8px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="cyber-btn"
              style={{
                fontSize: '0.9rem',
                padding: '12px',
                marginTop: '4px',
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
              <ArrowRight size={16} />
            </button>

            {/* Direct Quick Bypass Button */}
            <button
              type="button"
              onClick={handleOfficerLogin}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c084fc',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '4px',
                textDecoration: 'underline'
              }}
            >
              Direct Demo Access &rarr; Open Trinetra Command Center
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
