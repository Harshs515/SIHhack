import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Lock,
  ArrowRight,
  Cpu,
  Radio,
  Navigation,
  AlertCircle
} from 'lucide-react';
import AppLogo from '../components/AppLogo';
import {
  FIELD_OFFICERS,
  INVESTIGATORS,
  findPersonnelByBadge,
  verifyPersonnelPin
} from '../data/personnel';
import { saveSession } from '../utils/session';

const inputStyle = {
  width: '100%',
  fontSize: '0.86rem',
  padding: '9px 12px',
  borderRadius: '8px'
};

const iconInputStyle = {
  ...inputStyle,
  padding: '9px 12px 9px 36px'
};

export default function AuthLandingPage() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('officer');

  const [fieldOfficerId, setFieldOfficerId] = useState('');
  const [fieldBadge, setFieldBadge] = useState('');
  const [fieldUnit, setFieldUnit] = useState('');
  const [fieldPin, setFieldPin] = useState('');
  const [fieldError, setFieldError] = useState('');

  const [investigatorId, setInvestigatorId] = useState('');
  const [officerBadge, setOfficerBadge] = useState('');
  const [officerUnit, setOfficerUnit] = useState('');
  const [officerPin, setOfficerPin] = useState('');
  const [officerError, setOfficerError] = useState('');

  const applyOfficerRecord = (person, kind) => {
    if (kind === 'field') {
      setFieldOfficerId(person?.id || '');
      setFieldBadge(person?.badge || '');
      setFieldUnit(person?.unit || '');
      setFieldError('');
      return;
    }
    setInvestigatorId(person?.id || '');
    setOfficerBadge(person?.badge || '');
    setOfficerUnit(person?.unit || '');
    setOfficerError('');
  };

  const handleSelectFieldOfficer = (id) => {
    const person = FIELD_OFFICERS.find((o) => o.id === id) || null;
    applyOfficerRecord(person, 'field');
  };

  const handleSelectInvestigator = (id) => {
    const person = INVESTIGATORS.find((o) => o.id === id) || null;
    applyOfficerRecord(person, 'investigator');
  };

  const handleBadgeLookup = (badge, kind) => {
    if (kind === 'field') {
      setFieldBadge(badge);
      const person = findPersonnelByBadge(FIELD_OFFICERS, badge);
      if (person) {
        setFieldOfficerId(person.id);
        setFieldUnit(person.unit);
      }
      return;
    }
    setOfficerBadge(badge);
    const person = findPersonnelByBadge(INVESTIGATORS, badge);
    if (person) {
      setInvestigatorId(person.id);
      setOfficerUnit(person.unit);
    }
  };

  const handleOfficerLogin = (e) => {
    if (e) e.preventDefault();
    const person =
      INVESTIGATORS.find((o) => o.id === investigatorId) ||
      findPersonnelByBadge(INVESTIGATORS, officerBadge);

    if (!person) {
      setOfficerError('Unknown Badge ID. Select a registered investigator.');
      return;
    }
    if (!verifyPersonnelPin(person, officerPin)) {
      setOfficerError(`Invalid PIN for ${person.name}.`);
      return;
    }
    saveSession({ role: 'investigator', profile: person });
    navigate('/dashboard');
  };

  const handleFieldOfficerLogin = (e) => {
    if (e) e.preventDefault();
    const person =
      FIELD_OFFICERS.find((o) => o.id === fieldOfficerId) ||
      findPersonnelByBadge(FIELD_OFFICERS, fieldBadge);

    if (!person) {
      setFieldError('Unknown Badge ID. Select a registered field officer.');
      return;
    }
    if (!verifyPersonnelPin(person, fieldPin)) {
      setFieldError(`Invalid PIN for ${person.name}.`);
      return;
    }
    saveSession({ role: 'field_officer', profile: person });
    navigate('/field-officer');
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

      <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '780px' }}>
        <div style={{
          width: '70px',
          height: '4px',
          background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)',
          borderRadius: '4px',
          margin: '0 auto 16px'
        }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <AppLogo size={32} radius={8} />
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '0.04em', fontFamily: 'var(--font-display)' }}>
            TRINETRA • UNIFIED AUTHENTICATION GATEWAY
          </span>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 8px', letterSpacing: '-0.02em' }}>
          Select Your Access Portal
        </h1>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
          Secure entry for Law Enforcement Officers accessing predictive command intelligence.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1280px'
      }}>

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
            Mobile workflow for patrol officers. Real-time ATM cash-out interception alerts, victim Golden Window timers, and location dispatch.
          </p>

          <form onSubmit={handleFieldOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Registered Field Officer
              </label>
              <select
                value={fieldOfficerId}
                onChange={(e) => handleSelectFieldOfficer(e.target.value)}
                className="cyber-input"
                style={inputStyle}
              >
                <option value="">Select field officer</option>
                {FIELD_OFFICERS.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} · {officer.badge}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Officer Badge ID
                </label>
                <input
                  type="text"
                  value={fieldBadge}
                  onChange={(e) => handleBadgeLookup(e.target.value, 'field')}
                  placeholder="e.g. DL/CY/1204"
                  className="cyber-input"
                  style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
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
                  placeholder="Assigned patrol unit"
                  className="cyber-input"
                  style={inputStyle}
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
                  placeholder="Enter officer PIN"
                  className="cyber-input"
                  style={iconInputStyle}
                />
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                PIN is the last 4 digits of the selected officer's badge.
              </p>
            </div>

            {fieldError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#ff7597' }}>
                <AlertCircle size={13} />
                {fieldError}
              </div>
            )}

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
          </form>
        </div>

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

          <form onSubmit={handleOfficerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Registered Investigator
              </label>
              <select
                value={investigatorId}
                onChange={(e) => handleSelectInvestigator(e.target.value)}
                className="cyber-input"
                style={inputStyle}
              >
                <option value="">Select investigator</option>
                {INVESTIGATORS.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} · {officer.badge}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Badge ID
                </label>
                <input
                  type="text"
                  value={officerBadge}
                  onChange={(e) => handleBadgeLookup(e.target.value, 'investigator')}
                  placeholder="e.g. DL/CYB/8842"
                  className="cyber-input"
                  style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
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
                  placeholder="Assigned cyber unit"
                  className="cyber-input"
                  style={inputStyle}
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
                  placeholder="Enter investigator PIN"
                  className="cyber-input"
                  style={iconInputStyle}
                />
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                PIN is the last 4 digits of the selected investigator's badge.
              </p>
            </div>

            {officerError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#ff7597' }}>
                <AlertCircle size={13} />
                {officerError}
              </div>
            )}

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
          </form>
        </div>

      </div>

    </div>
  );
}
