import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Filter,
  X,
  Zap
} from 'lucide-react';
import { submitComplaint, trackComplaint, getComplaints } from '../api/api';

const SAMPLE_PRESETS = [
  {
    name: 'Digital Arrest CBI Scam (₹8.5L, Delhi)',
    victim: 'Rajesh Sharma',
    contact: '+91-98112-44120',
    type: 'Digital Arrest Scam',
    amount: '850000',
    bank: 'State Bank of India',
    district: 'Rohini, Delhi'
  },
  {
    name: 'Stock Trading WhatsApp Group Scam (₹12.5L, Mumbai)',
    victim: 'Vikram Mehta',
    contact: '+91-98201-99882',
    type: 'Stock Market / Trading Scam',
    amount: '1250000',
    bank: 'ICICI Bank',
    district: 'Mumbai Suburban, Maharashtra'
  },
  {
    name: 'Electricity KYC Phishing (₹75k, Ahmedabad)',
    victim: 'Dharmesh Patel',
    contact: '+91-98240-55443',
    type: 'KYC Update / Electricity Scam',
    amount: '75000',
    bank: 'Bank of Baroda',
    district: 'Ahmedabad, Gujarat'
  }
];

export default function NcrpComplaintsPage({ complaints = null, onAddComplaint }) {
  const [complaintList, setComplaintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Form input state
  const [victimName, setVictimName] = useState('');
  const [victimContact, setVictimContact] = useState('');
  const [fraudType, setFraudType] = useState('Digital Arrest Scam');
  const [amount, setAmount] = useState('');
  const [bankMentioned, setBankMentioned] = useState('State Bank of India');
  const [district, setDistrict] = useState('');
  const [complaintText, setComplaintText] = useState('');

  const [ingestSuccess, setIngestSuccess] = useState(null);
  const [ingestError, setIngestError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoadingInitial(true);
      try {
        const response = await getComplaints({ limit: 100 });
        const data = response.data || response;
        setComplaintList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
        setComplaintList([]);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setIsLoadingComplaints(true);
      try {
        const response = await getComplaints({ limit: 100 });
        const data = response.data || response;
        setComplaintList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
        setComplaintList([]);
      } finally {
        setIsLoadingComplaints(false);
      }
      return;
    }

    setIsLoadingComplaints(true);
    try {
      const response = await getComplaints({ search: term });
      const data = response.data || response;
      setComplaintList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search failed:', error);
      setComplaintList([]);
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setVictimName(preset.victim);
    setVictimContact(preset.contact);
    setFraudType(preset.type);
    setAmount(preset.amount);
    setBankMentioned(preset.bank);
    setDistrict(preset.district);
  };



  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIngestError(null);

    const districtName = district.split(',')[0]?.trim() || 'Delhi';
    const stateName = district.split(',')[1]?.trim() || 'Delhi';
    const payload = {
      acknowledgement_no: `ACK-${Date.now()}`,
      victim_name: victimName || 'Citizen Report',
      victim_contact: victimContact || '+91-98765-43210',
      fraud_category: fraudType,
      fraud_amount: parseFloat(amount) || 350000,
      incident_timestamp: new Date().toISOString(),
      mule_bank_name: bankMentioned,
      mule_account_no: '39081293812',
      victim_address: district || `${districtName}, ${stateName}`,
      district: districtName,
      state: stateName,
      status: 'UNDER_INVESTIGATION',
      latitude: district.toLowerCase().includes('mumbai') ? 19.076 : (district.toLowerCase().includes('ahmedabad') ? 23.0225 : 28.7041),
      longitude: district.toLowerCase().includes('mumbai') ? 72.8777 : (district.toLowerCase().includes('ahmedabad') ? 72.5714 : 77.1025),
    };

    try {
      const response = await submitComplaint(payload);
      const saved = response.data || payload;
      setComplaintList((prev) => [saved, ...(Array.isArray(prev) ? prev : []).filter((c) => c.acknowledgement_no !== saved.acknowledgement_no)]);
      if (onAddComplaint) onAddComplaint(saved);
      setIngestSuccess(`Complaint #${saved.acknowledgement_no} saved via API and queued for Spatial ML triage.`);
      setShowSubmitModal(false);
      setTimeout(() => setIngestSuccess(null), 4000);
    } catch (err) {
      setIngestError(err.message || 'Failed to save complaint through the API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowClick = async (complaint) => {
    setSelectedComplaint(complaint);
    setIsLoadingDetail(true);
    try {
      const ack = complaint.acknowledgement_no;
      if (ack) {
        const res = await trackComplaint(ack);
        const data = res.data || res;
        setSelectedComplaint((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.warn('Could not fetch linked hotspot details:', e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filtered = (Array.isArray(complaintList) ? complaintList : []).filter((c) => {
    const cStatus = c.status || 'UNDER_INVESTIGATION';
    const matchesStatus = selectedStatus === 'ALL' || cStatus.toUpperCase() === selectedStatus.toUpperCase();
    if (!matchesStatus) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (c.complaint_id || '').toLowerCase().includes(q) ||
      (c.acknowledgement_no || '').toLowerCase().includes(q) ||
      (c.victim_name || '').toLowerCase().includes(q) ||
      (c.crime_category || '').toLowerCase().includes(q) ||
      (c.fraud_category || '').toLowerCase().includes(q) ||
      (c.sub_category || '').toLowerCase().includes(q) ||
      (c.mule_bank_name || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q) ||
      (c.state || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        </div>
      </div>

      {ingestSuccess && (
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#00e676', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {ingestSuccess}
        </div>
      )}

      {ingestError && (
        <div style={{ background: 'rgba(255, 56, 92, 0.12)', border: '1px solid rgba(255, 56, 92, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#ff7597', fontSize: '0.82rem', fontWeight: 700 }}>
          {ingestError}
        </div>
      )}

      {/* Complaints Data Table */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            Triaged 1930 / NCRP Cybercrime Feed ({filtered.length})
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="#00e5ff" />
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="cyber-select"
                style={{ fontSize: '0.75rem', padding: '5px 10px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
                <option value="PROCESSED">PROCESSED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search Ack, Victim, Bank, District..."
                value={searchTerm}
                onChange={(e) => { handleSearch(e.target.value); setCurrentPage(1); }}
                className="cyber-input"
                style={{ width: '100%', paddingLeft: '32px', fontSize: '0.78rem' }}
              />
              {isLoadingComplaints && (
                <div style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '0.7rem', color: '#00e5ff' }}>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        <table className="cyber-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Date & Time</th>
              <th>Crime Category</th>
              <th>Sub Category</th>
              <th>Amount Stolen</th>
              <th>Location</th>
              <th>Source & Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingInitial ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading complaints from database...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No complaints found. Try adjusting your search or submit a new complaint.
                </td>
              </tr>
            ) : (
              paginated.map((c) => {
                const amountVal = c.amount || c.fraud_amount || 0;
                const district = c.district || 'Unknown';
                const state = c.state || 'Unknown';
                const status = c.status || 'UNDER_INVESTIGATION';
                const dateObj = new Date(c.complaint_date || c.created_at);
                const formattedDate = dateObj.toLocaleDateString();
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr
                    key={c.id || c.complaint_id}
                    onClick={() => handleRowClick(c)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view details"
                  >
                    <td><strong style={{ color: '#00e5ff' }}>{c.complaint_id || c.acknowledgement_no}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{formattedDate}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{formattedTime}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
                        {c.crime_category || c.fraud_category || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {c.sub_category || 'N/A'}
                      </span>
                    </td>
                    <td style={{ color: '#00e676', fontWeight: 800 }}>₹{parseFloat(amountVal).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{c.city ? `${c.city}, ` : ''}{district}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{state}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginBottom: '4px' }}>
                        Source: {c.source || 'NCRP'}
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        color: status.toUpperCase() === 'PROCESSED' ? '#00e676' : '#cbd5e1',
                        background: status.toUpperCase() === 'PROCESSED' ? 'rgba(0,230,118,0.12)' : 'rgba(255,255,255,0.06)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: status.toUpperCase() === 'PROCESSED' ? '1px solid rgba(0,230,118,0.25)' : 'none'
                      }}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!isLoadingInitial && filtered.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              <strong style={{ color: '#00e5ff' }}>{filtered.length}</strong> complaints
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: safePage === 1 ? 'var(--text-muted)' : '#fff',
                  cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                  padding: '4px 8px',
                  fontSize: '0.75rem'
                }}
              >«</button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: safePage === 1 ? 'var(--text-muted)' : '#fff',
                  cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                  padding: '4px 10px',
                  fontSize: '0.75rem'
                }}
              >‹ Prev</button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 2px', fontSize: '0.75rem' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        background: safePage === p ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)',
                        border: safePage === p ? '1px solid rgba(0,229,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: safePage === p ? '#00e5ff' : '#fff',
                        cursor: 'pointer',
                        padding: '4px 9px',
                        fontSize: '0.75rem',
                        fontWeight: safePage === p ? 700 : 400
                      }}
                    >{p}</button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: safePage === totalPages ? 'var(--text-muted)' : '#fff',
                  cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                  padding: '4px 10px',
                  fontSize: '0.75rem'
                }}
              >Next ›</button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: safePage === totalPages ? 'var(--text-muted)' : '#fff',
                  cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                  padding: '4px 8px',
                  fontSize: '0.75rem'
                }}
              >»</button>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Detail & Linked Hotspot Panel/Modal */}
      {selectedComplaint && (
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
          <div className="glass-panel" style={{ width: '560px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="pulse-badge primary" style={{ marginBottom: '4px' }}>
                  {selectedComplaint.status || 'UNDER_INVESTIGATION'}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Complaint Dossier: {selectedComplaint.complaint_id || selectedComplaint.acknowledgement_no}
                </h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>COMPLAINANT TYPE & SOURCE</span>
                <div style={{ fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                  {selectedComplaint.complainant_type || 'Citizen'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Source: {selectedComplaint.source || 'NCRP Portal'}</div>
              </div>
              {/* <div> 
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>VICTIM NAME</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{selectedComplaint.victim_name || 'Citizen'}</div>
                </div> */}

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>FRAUD AMOUNT</span>
                <div style={{ fontWeight: 800, color: '#00e676', fontSize: '1.05rem' }}>
                  ₹{parseFloat(selectedComplaint.amount || selectedComplaint.fraud_amount || 0).toLocaleString()}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{new Date(selectedComplaint.complaint_date || selectedComplaint.created_at).toLocaleString()}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CRIME TYPOLOGY</span>
                <div style={{ fontWeight: 700, color: '#ffaa00' }}>
                  {selectedComplaint.crime_category || selectedComplaint.fraud_category || 'Unknown'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  Sub: {selectedComplaint.sub_category || 'N/A'}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LOCATION / JURISDICTION</span>
                <div style={{ fontWeight: 700, color: '#fff' }}>{selectedComplaint.district}, {selectedComplaint.state}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{selectedComplaint.victim_address || 'Address logged'}</div>
              </div>
            </div>

            {/* Linked ML Hotspot Intelligence */}
            {selectedComplaint.alert_level && (
              <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00e5ff' }}>
                    Linked ML Hotspot & Extraction Forecast
                  </span>
                  <span className={`pulse-badge ${selectedComplaint.alert_level === 'P1' ? 'danger' : 'warning'}`}>
                    {selectedComplaint.alert_level} ALERT
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {selectedComplaint.actionable_intelligence || 'Real-time high risk ATM withdrawal anomaly detected in target district. Proximity patrol alerted.'}
                </p>

                {selectedComplaint.risk_score && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Threat Risk Score: <strong style={{ color: '#ff385c' }}>{((selectedComplaint.risk_score) * 100).toFixed(0)}%</strong>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedComplaint(null)} className="cyber-btn cyber-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lodge Complaint Modal */}
      {false && (
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

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
                Quick Fill:
              </span>
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="interactive-chip"
                  style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                >
                  {preset.name}
                </button>
              ))}
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
                <button type="submit" className="cyber-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving via API...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
