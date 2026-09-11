import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Send,
  Search,
  AlertCircle,
  FileText,
  Lock
} from 'lucide-react';
import { MOCK_COMPLAINTS } from '../data/mockData';
import { submitComplaint, trackComplaint } from '../api/api';
import AppLogo from '../components/AppLogo';
import { getSession } from '../utils/session';

export default function NcrpCitizenPortalPage({ complaints = MOCK_COMPLAINTS, onAddComplaint }) {
  const navigate = useNavigate();
  const session = getSession();
  const citizen = session?.role === 'citizen' ? session.profile : null;

  // Form State
  const [victimName, setVictimName] = useState(citizen?.name || '');
  const [victimContact, setVictimContact] = useState(citizen?.mobile || '');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Digital Arrest Scam');
  const [amount, setAmount] = useState('');
  const [suspectBank, setSuspectBank] = useState('State Bank of India');
  const [suspectAccount, setSuspectAccount] = useState('');
  const [description, setDescription] = useState('');

  // Status & Tracking State
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [searchAck, setSearchAck] = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const incidentTimestamp = new Date().toISOString();
    const district = (city.split(',')[0] || 'Delhi').trim();
    const state = city.split(',')[1]?.trim() || 'Delhi';
    const latitude = city.toLowerCase().includes('mumbai') ? 19.0760 : (city.toLowerCase().includes('bengaluru') ? 12.9716 : (city.toLowerCase().includes('ahmedabad') ? 23.0225 : 28.7041));
    const longitude = city.toLowerCase().includes('mumbai') ? 72.8777 : (city.toLowerCase().includes('bengaluru') ? 77.5946 : (city.toLowerCase().includes('ahmedabad') ? 72.5714 : 77.1025));
    const newComplaint = {
      victim_name: victimName || 'Citizen Report',
      victim_phone: victimContact || '+91-98765-43210',
      fraud_category: category,
      fraud_amount: parseFloat(amount) || 100000,
      incident_timestamp: incidentTimestamp,
      victim_bank: '',
      mule_bank_name: suspectBank,
      mule_account_no: suspectAccount || '30981129482',
      lat: latitude,
      lng: longitude,
      district,
      state,
      description
    };

    try {
      const response = await submitComplaint({
        ...newComplaint,
        victim_contact: newComplaint.victim_phone,
        victim_address: city || 'New Delhi',
        latitude: newComplaint.lat,
        longitude: newComplaint.lng,
      });
      const complaint = response.data || newComplaint;

      if (onAddComplaint) onAddComplaint(complaint);

      setSubmittedComplaint(complaint);
    } catch (err) {
      setSubmittedComplaint(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchAck.trim()) return;
    try {
      const response = await trackComplaint(searchAck.trim());
      setSearchedComplaint(response.data || response);
    } catch (err) {
      setSearchedComplaint('NOT_FOUND');
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '20px 20px 60px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Clean Header Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <AppLogo size={46} radius={12} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                NCRP Citizen Cyber Crime Reporting Portal
              </h1>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              National Cyber Crime Reporting Portal (cybercrime.gov.in)
            </p>
          </div>
        </div>

        {/* Helpline & Dashboard Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 56, 92, 0.12)',
            border: '1px solid rgba(255, 56, 92, 0.3)',
            padding: '8px 16px',
            borderRadius: '10px'
          }}>
            <PhoneCall size={16} color="#ff385c" />
            <div>
              <span style={{ fontSize: '0.62rem', color: '#ff7597', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                Helpline
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                1930
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="cyber-btn cyber-btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Trinetra Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. Success Banner (when submitted) */}
      {submittedComplaint && (
        <div className="glass-panel" style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.12) 0%, rgba(13, 20, 36, 0.95) 100%)',
          border: '1px solid rgba(0, 230, 118, 0.45)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#00e676" />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Complaint Registered Successfully!
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#00e5ff', fontFamily: 'var(--font-mono)' }}>
                Acknowledgement ID: #{submittedComplaint.acknowledgement_no} • ₹{parseFloat(submittedComplaint.fraud_amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/gis-heatmap')}
            className="cyber-btn"
            style={{ fontSize: '0.8rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>View on GIS Map</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 3. Spacious, User-Friendly Complaint Form */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#00e5ff" />
            Lodge Cyber Crime Complaint
          </h2>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Official Citizen Reporting Interface
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Row 1: Victim Name & Mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Complainant Full Name *
              </label>
              <input
                type="text"
                required
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="cyber-input"
                style={{ width: '100%', fontSize: '0.94rem', padding: '12px 16px', borderRadius: '10px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={victimContact}
                onChange={(e) => setVictimContact(e.target.value)}
                placeholder="+91-98765-43210"
                className="cyber-input"
                style={{ width: '100%', fontSize: '0.94rem', padding: '12px 16px', borderRadius: '10px' }}
              />
            </div>
          </div>

          {/* Row 2: Location & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                City / District, State *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Rohini, Delhi"
                className="cyber-input"
                style={{ width: '100%', fontSize: '0.94rem', padding: '12px 16px', borderRadius: '10px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Category of Cyber Crime *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="cyber-input"
                style={{ width: '100%', fontSize: '0.94rem', padding: '12px 16px', borderRadius: '10px' }}
              >
                <option value="Digital Arrest Scam">Digital Arrest Scam (Fake Police / CBI)</option>
                <option value="Stock Market / Trading Scam">Stock Market / WhatsApp Trading Scam</option>
                <option value="KYC Update / Electricity Scam">Electricity KYC / Malicious APK</option>
                <option value="Task / Part-Time Job Fraud">Telegram / Part-Time Job Scam</option>
                <option value="UPI / QR Fraud">UPI / Payment QR Phishing</option>
                <option value="Loan App / Extortion Scam">Instant Loan App Extortion</option>
                <option value="OTP Phishing Scam">Bank OTP / Netbanking Phishing</option>
              </select>
            </div>
          </div>

          {/* Row 3: Amount Lost & Suspect Bank */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Total Amount Lost (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 850000"
                className="cyber-input"
                style={{
                  width: '100%',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#00e676',
                  fontFamily: 'var(--font-mono)',
                  padding: '12px 16px',
                  borderRadius: '10px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Suspect Beneficiary Bank *
              </label>
              <select
                value={suspectBank}
                onChange={(e) => setSuspectBank(e.target.value)}
                className="cyber-input"
                style={{ width: '100%', fontSize: '0.94rem', padding: '12px 16px', borderRadius: '10px' }}
              >
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
              </select>
            </div>
          </div>

          {/* Row 4: Suspect Account Number / UPI */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Suspect Mule Account Number or UPI ID *
            </label>
            <input
              type="text"
              required
              value={suspectAccount}
              onChange={(e) => setSuspectAccount(e.target.value)}
              placeholder="e.g. 30981129482 or mule_beneficiary@upi"
              className="cyber-input"
              style={{
                width: '100%',
                fontSize: '0.94rem',
                fontFamily: 'var(--font-mono)',
                padding: '12px 16px',
                borderRadius: '10px'
              }}
            />
          </div>

          {/* Row 5: Incident Narrative */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Incident Narrative / Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how the fraud occurred, what WhatsApp/call messages were received, and how the transfer was executed..."
              className="cyber-input"
              style={{
                width: '100%',
                fontSize: '0.92rem',
                padding: '14px 16px',
                borderRadius: '10px',
                resize: 'vertical',
                minHeight: '120px',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cyber-btn"
            style={{
              marginTop: '6px',
              padding: '14px 28px',
              fontSize: '0.96rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)'
            }}
          >
            <Send size={18} />
            <span>{isSubmitting ? 'Registering Complaint...' : 'Submit Cyber Crime Complaint'}</span>
          </button>

        </form>
      </div>

      {/* 4. Simple Track Status Section */}
      <div className="glass-panel" style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="#00e5ff" /> Track Existing Complaint Status
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Enter your Acknowledgment Number
          </span>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchAck}
            onChange={(e) => setSearchAck(e.target.value)}
            placeholder="Enter Ack ID (e.g. 2026MHA001284)..."
            className="cyber-input"
            style={{ flex: 1, fontSize: '0.9rem', padding: '10px 16px', borderRadius: '8px' }}
          />
          <button type="submit" className="cyber-btn cyber-btn-secondary" style={{ fontSize: '0.84rem', padding: '0 20px' }}>
            Track Status
          </button>
        </form>

        {searchedComplaint === 'NOT_FOUND' && (
          <span style={{ fontSize: '0.78rem', color: '#ff5277', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> No complaint found for this Acknowledgment Number.
          </span>
        )}

        {searchedComplaint && searchedComplaint !== 'NOT_FOUND' && (
          <div style={{
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            padding: '14px 18px',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                #{searchedComplaint.acknowledgement_no} • {searchedComplaint.victim_name}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {searchedComplaint.fraud_category} • ₹{parseFloat(searchedComplaint.fraud_amount || 0).toLocaleString('en-IN')} • {searchedComplaint.district}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Alert level: {searchedComplaint.alert_level || 'Not processed'} • Predicted district: {searchedComplaint.predicted_district || 'Not processed'}
              </div>
              {searchedComplaint.actionable_intelligence && (
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Actionable intelligence: {searchedComplaint.actionable_intelligence}
                </div>
              )}
            </div>
            <span className="pulse-badge success" style={{ fontSize: '0.72rem' }}>
              {searchedComplaint.status || 'ACTIVE_INTERVENTION'}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
