import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  CheckCircle2,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Layers,
  Printer,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  MOCK_FRAUD_DISTRIBUTION,
  MOCK_HOURLY_CASHOUT_PATTERNS,
  MOCK_STATE_COMPARISON
} from '../data/mockData';

export default function AnalyticsReportsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const handleExportPDF = () => {
    setDownloadSuccess('📄 I4C Sovereign Intelligence Dossier downloaded (MHA_DOSSIER_2026_0891.pdf).');
    setShowDossierModal(false);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 24px 28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Analytics</h2>
          <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '2px' }}>Recovery benchmarks & intelligence reports</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Time range chips */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setSelectedTimeRange('24h')}
              className={`interactive-chip ${selectedTimeRange === '24h' ? 'active' : ''}`}
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              24h
            </button>
            <button
              onClick={() => setSelectedTimeRange('7d')}
              className={`interactive-chip ${selectedTimeRange === '7d' ? 'active' : ''}`}
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              7d
            </button>
            <button
              onClick={() => setSelectedTimeRange('30d')}
              className={`interactive-chip ${selectedTimeRange === '30d' ? 'active' : ''}`}
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              30d
            </button>
          </div>

          <button
            onClick={() => setShowDossierModal(true)}
            className="cyber-btn"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <FileText size={14} /> Generate I4C Dossier
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', padding: '10px 16px', borderRadius: '8px', color: '#00e676', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {downloadSuccess}
        </div>
      )}

      {/* Recovery Impact Hero KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #00e676' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Proactive Fund Recovery Rate</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00e676', margin: '4px 0', fontFamily: 'var(--font-display)' }}>78.4%</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>+56% increase over legacy 22.4% baseline</span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #00e5ff' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Intercepted Fraud Pipeline</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00e5ff', margin: '4px 0', fontFamily: 'var(--font-display)' }}>₹48.60 Cr</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Across 47 targeted ATM clusters</span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #ffaa00' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Golden Window Lead Time</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffaa00', margin: '4px 0', fontFamily: 'var(--font-display)' }}>42 Mins</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Advance warning before cash extraction</span>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #a855f7' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cross-Jurisdiction LEA Teams</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', margin: '4px 0', fontFamily: 'var(--font-display)' }}>38 Units</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Delhi, MH, KA, TG, GJ coordinated</span>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Chart 1: Fraud Typology vs MHA Benchmark */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PieIcon size={16} color="#00e5ff" /> Cybercrime Typology Breakdown vs MHA Benchmark (%)
          </h3>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_FRAUD_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0c1424', border: '1px solid rgba(0,229,255,0.35)', borderRadius: '8px', fontSize: '0.75rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="count" name="Dataset Observed (%)" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mha_benchmark" name="MHA Benchmark (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hourly Cashout Extraction Pattern (Golden Hour) */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="#ff385c" /> Hourly Cashout Withdrawal Velocity (₹ Lakhs & Attempts)
          </h3>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_HOURLY_CASHOUT_PATTERNS} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0c1424', border: '1px solid rgba(255,56,92,0.35)', borderRadius: '8px', fontSize: '0.75rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey="volume_lakhs" name="Withdrawal Vol (₹ Lakhs)" stroke="#ff385c" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="attempts" name="Extraction Attempts" stroke="#ffaa00" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* State-Wise Recovery Comparison Table */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
          State-Wise Proactive Intervention Recovery Benchmarks
        </h3>

        <table className="cyber-table">
          <thead>
            <tr>
              <th>State / Focus Zone</th>
              <th>Total Complaints Handled</th>
              <th>High-Risk ATM Clusters</th>
              <th>Baseline Recovery Rate</th>
              <th>Proactive Recovery Rate (TRINETRA)</th>
              <th>Efficiency Delta</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_STATE_COMPARISON.map((s, idx) => (
              <tr key={idx}>
                <td><strong>{s.state}</strong></td>
                <td>{s.complaints.toLocaleString()}</td>
                <td>{s.predicted_hotspots} Hotspots</td>
                <td style={{ color: 'var(--text-muted)' }}>{s.baseline_rate}%</td>
                <td style={{ color: '#00e676', fontWeight: 800 }}>{s.recovery_rate_proactive}%</td>
                <td>
                  <span className="pulse-badge success" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    +{(s.recovery_rate_proactive - s.baseline_rate).toFixed(1)}% Gain
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* I4C Intelligence Dossier Modal */}
      {showDossierModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '600px', maxHeight: '85vh', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00e5ff', textTransform: 'uppercase' }}>MINISTRY OF HOME AFFAIRS • I4C</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Proactive Cybercrime Intelligence Dossier</h3>
              </div>
              <button onClick={() => setShowDossierModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Dossier Reference:</strong> I4C/DOSSIER/2026/DEL-NW-07</div>
              <div><strong>Classification:</strong> RESTRICTED // LAW ENFORCEMENT OPERATIONAL</div>
              <div><strong>Target Cluster:</strong> Rohini Sector 8 Market ATM Node (DEL-NW-7)</div>
              <div><strong>Predicted Golden Window:</strong> 45–60 Minutes remaining</div>
              <div><strong>Total Linked Fraud:</strong> ₹14,50,000 across 4 layered mule accounts</div>
              <div><strong>Assigned LEA Station:</strong> Rohini Cyber Crime Police Station (Insp. Rakesh Malik)</div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              <strong>Operational Directive:</strong> Immediate vectoring of PCR Patrol Alpha-1 recommended to Sector 8 Market complex. State Bank of India nodal risk desk notified for temporary cardless cashout lock on identified Layer-2 mule accounts.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setShowDossierModal(false)} className="cyber-btn cyber-btn-secondary">
                Close
              </button>
              <button onClick={handleExportPDF} className="cyber-btn">
                <Download size={14} /> Download PDF Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
