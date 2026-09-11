import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Database,
  Tag,
  Zap,
  ArrowRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { MOCK_COMPLAINTS } from '../data/mockData';

const SAMPLE_PRESETS = [
  {
    name: 'Digital Arrest CBI Scam (₹8.5L, Delhi)',
    text: 'I received an urgent call on WhatsApp from an individual claiming to be a CBI Officer in Mumbai. He claimed my Aadhaar was linked to a money laundering case and coerced me to transfer ₹8,50,000 to an SBI verification account in Rohini.',
    victim: 'Rajesh Sharma',
    contact: '+91-98112-44120',
    type: 'Digital Arrest Scam',
    amount: '850000',
    bank: 'State Bank of India',
    district: 'Rohini, Delhi'
  },
  {
    name: 'Stock Trading WhatsApp Group Scam (₹12.5L, Mumbai)',
    text: 'I was added to a VIP Institutional Trading group promising 400% IPO profits. After depositing ₹12,50,000 into an ICICI Bank mule account in Andheri, the app froze withdrawals and demanded a 20% release fee.',
    victim: 'Vikram Mehta',
    contact: '+91-98201-99882',
    type: 'Stock Market / Trading Scam',
    amount: '1250000',
    bank: 'ICICI Bank',
    district: 'Mumbai Suburban, Maharashtra'
  },
  {
    name: 'Electricity KYC Phishing (₹75k, Ahmedabad)',
    text: 'Received an SMS saying power supply would be disconnected tonight. Called the provided number and downloaded an APK file which transferred ₹75,000 to a Bank of Baroda account.',
    victim: 'Dharmesh Patel',
    contact: '+91-98240-55443',
    type: 'KYC Update / Electricity Scam',
    amount: '75000',
    bank: 'Bank of Baroda',
    district: 'Ahmedabad, Gujarat'
  }
];

export default function NcrpComplaintsPage({ complaints = MOCK_COMPLAINTS, onAddComplaint }) {
  const navigate = useNavigate();
  const [complaintList, setComplaintList] = useState(complaints);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form input state
  const [victimName, setVictimName] = useState(SAMPLE_PRESETS[0].victim);
  const [victimContact, setVictimContact] = useState(SAMPLE_PRESETS[0].contact);
  const [fraudType, setFraudType] = useState(SAMPLE_PRESETS[0].type);
  const [amount, setAmount] = useState(SAMPLE_PRESETS[0].amount);
  const [bankMentioned, setBankMentioned] = useState(SAMPLE_PRESETS[0].bank);
  const [district, setDistrict] = useState(SAMPLE_PRESETS[0].district);
  const [complaintText, setComplaintText] = useState(SAMPLE_PRESETS[0].text);

  const [extractedEntities, setExtractedEntities] = useState(null);
  const [isProcessingNlp, setIsProcessingNlp] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(null);

  const handleApplyPreset = (preset) => {
    setVictimName(preset.victim);
    setVictimContact(preset.contact);
    setFraudType(preset.type);
    setAmount(preset.amount);
    setBankMentioned(preset.bank);
    setDistrict(preset.district);
    setComplaintText(preset.text);
    triggerNlpForText(preset);
  };

  const triggerNlpForText = (preset) => {
    setIsProcessingNlp(true);
    setTimeout(() => {
      setExtractedEntities({
        victim_city: preset.district.split(',')[1]?.trim() || 'Delhi NCR',
        district_code: preset.district.split(',')[0],
        amount_extracted: `₹${parseFloat(preset.amount).toLocaleString()}`,
        amount_band: parseFloat(preset.amount) > 500000 ? 'CRITICAL (> ₹5L)' : 'HIGH (₹1L - ₹5L)',
        fraud_category: preset.type,
        bank_name_extracted: preset.bank,
        time_elapsed: '18 mins ago (Golden Hour Active)',
        confidence_score: 0.968
      });
      setIsProcessingNlp(false);
    }, 450);
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    const newComp = {
      id: complaintList.length + 1,
      acknowledgement_no: `2026MHA00${1290 + complaintList.length}`,
      victim_name: victimName || 'Citizen Report',
      victim_contact: victimContact || '+91-98765-43210',
      fraud_category: fraudType,
      fraud_amount: parseFloat(amount) || 350000,
      incident_timestamp: new Date().toISOString(),
      mule_bank_name: bankMentioned,
      mule_account_no: '39081293812',
      latitude: 28.7041,
      longitude: 77.1025,
      district: district.split(',')[0],
      state: district.split(',')[1]?.trim() || 'Delhi',
      status: 'ACTIVE_INTERVENTION'
    };

    setComplaintList([newComp, ...complaintList]);
    if (onAddComplaint) onAddComplaint(newComp);
    setIngestSuccess(`Complaint #${newComp.acknowledgement_no} published to Kafka complaints.raw and triaged to Spatial ML Engine!`);
    setShowSubmitModal(false);
    setTimeout(() => setIngestSuccess(null), 4000);
  };

  const filtered = complaintList.filter(c =>
    (c.acknowledgement_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.victim_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.fraud_category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mule_bank_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 24px 28px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00e5ff 0%, #3a7bd5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#040914',
            boxShadow: '0 0 18px rgba(0, 229, 255, 0.4)'
          }}>
            <FileSpreadsheet size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                NCRP Complaint Triage & NLP Ingestion
              </h2>
              <span className="pulse-badge primary">
                <span className="pulse-dot"></span> 1930 Helpline Live
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Automated Named Entity Recognition (NER) • Kafka Streaming Ingestion • Golden Hour Feature Vectorizer
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/ncrp-portal')}
            className="cyber-btn cyber-btn-secondary"
            style={{ fontSize: '0.8rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={15} color="#00e5ff" />
            <span>Open Citizen Portal Simulator</span>
            <ExternalLink size={13} />
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="cyber-btn"
            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          >
            <PlusCircle size={15} /> Fast Ingest Modal
          </button>
        </div>
      </div>

      {ingestSuccess && (
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#00e676', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {ingestSuccess}
        </div>
      )}

      {/* Interactive NLP Parser Demo & Preset Selector */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> SparkNLP Structured Streaming Entity Extractor
            </h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Test how raw unstructured complaint text is instantly converted into structured geospatial feature vectors.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
              Try Presets:
            </span>
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="interactive-chip"
                style={{ fontSize: '0.7rem', padding: '4px 10px' }}
              >
                <Zap size={11} color="#00e5ff" /> {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Citizen Complaint Narrative (Unstructured Text):
            </label>
            <textarea
              rows={4}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="cyber-input"
              style={{ width: '100%', resize: 'none', fontSize: '0.78rem', lineHeight: '1.45' }}
            />
            <button
              onClick={() => triggerNlpForText({ text: complaintText, district, amount, type: fraudType, bank: bankMentioned })}
              disabled={isProcessingNlp}
              className="cyber-btn cyber-btn-secondary"
              style={{ marginTop: '8px', fontSize: '0.75rem' }}
            >
              <Sparkles size={13} color="#00e5ff" />
              {isProcessingNlp ? 'Extracting NER Entities...' : 'Run SparkNLP NER Extraction'}
            </button>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Parsed Geospatial & Risk Vectors
            </span>

            {extractedEntities ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', fontSize: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>VICTIM LOCATION</span>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{extractedEntities.victim_city} ({extractedEntities.district_code})</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>EXTRACTED AMOUNT</span>
                  <div style={{ fontWeight: 800, color: '#00e676' }}>{extractedEntities.amount_extracted}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>FRAUD TYPOLOGY</span>
                  <div style={{ fontWeight: 700, color: '#ff385c' }}>{extractedEntities.fraud_category}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>MULE BENEFICIARY</span>
                  <div style={{ fontWeight: 700, color: '#ffaa00' }}>{extractedEntities.bank_name_extracted}</div>
                </div>

                <div style={{ background: 'rgba(0, 229, 255, 0.08)', padding: '6px 8px', borderRadius: '6px', gridColumn: '1 / -1', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                  <span style={{ color: '#00e5ff', fontSize: '0.68rem', fontWeight: 700 }}>
                    ⚡ MLOps Feature Vector Ready: Confidence {extractedEntities.confidence_score * 100}% • {extractedEntities.time_elapsed}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '20px', textAlign: 'center' }}>
                Click "Run SparkNLP NER Extraction" or select a preset above to inspect parsed vector tokens.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaints Data Table */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            Triaged 1930 / NCRP Cybercrime Feed ({filtered.length})
          </h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search Ack No, Victim, Bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cyber-input"
              style={{ width: '100%', paddingLeft: '32px', fontSize: '0.78rem' }}
            />
          </div>
        </div>

        <table className="cyber-table">
          <thead>
            <tr>
              <th>Ack Number</th>
              <th>Victim Details</th>
              <th>Fraud Typology</th>
              <th>Amount Stolen</th>
              <th>Mule Account & Bank</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><strong style={{ color: '#00e5ff' }}>{c.acknowledgement_no}</strong></td>
                <td>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{c.victim_name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.victim_contact}</div>
                </td>
                <td>
                  <span className="pulse-badge warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {c.fraud_category}
                  </span>
                </td>
                <td style={{ color: '#00e676', fontWeight: 800 }}>₹{parseFloat(c.fraud_amount || 0).toLocaleString()}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{c.mule_bank_name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.mule_account_no || 'Tracking IFSC'}</div>
                </td>
                <td>{c.district}, {c.state}</td>
                <td>
                  <span style={{ fontSize: '0.68rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px' }}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lodge Complaint Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '520px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Lodge Citizen Cybercrime Report</h3>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Victim Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  className="cyber-input"
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fraud Typology</label>
                  <select value={fraudType} onChange={(e) => setFraudType(e.target.value)} className="cyber-select" style={{ width: '100%', marginTop: '4px' }}>
                    <option value="Digital Arrest Scam">Digital Arrest Scam</option>
                    <option value="UPI / QR Fraud">UPI / QR Fraud</option>
                    <option value="Stock Market / Trading Scam">Stock Market / Trading Scam</option>
                    <option value="OTP Phishing Scam">OTP Phishing Scam</option>
                    <option value="Task / Job Fraud">Task / Job Fraud</option>
                    <option value="SIM Swap Fraud">SIM Swap Fraud</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount Stolen (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="cyber-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mule Beneficiary Bank</label>
                  <select value={bankMentioned} onChange={(e) => setBankMentioned(e.target.value)} className="cyber-select" style={{ width: '100%', marginTop: '4px' }}>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Victim District / State</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="cyber-input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} className="cyber-btn cyber-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="cyber-btn">
                  Publish to Kafka Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
