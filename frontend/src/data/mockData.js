// Mock & Domain Intelligence Dataset for SIH26184 / Team Trinetra
// Predictive Analytics Framework for Cybercrime Cash Withdrawal Forecasting

export const MOCK_COMPLAINTS = [
  {
    id: 1,
    acknowledgement_no: '2026MHA001284',
    victim_name: 'Rajesh Sharma',
    victim_contact: '+91-98112-44120',
    fraud_category: 'Digital Arrest Scam',
    fraud_amount: 850000,
    incident_timestamp: '2026-08-29T18:45:00Z',
    mule_bank_name: 'State Bank of India',
    mule_account_no: '30981129482',
    latitude: 28.6289,
    longitude: 77.2065,
    district: 'New Delhi',
    state: 'Delhi',
    status: 'ACTIVE_INTERVENTION',
    hop_count: 3,
    velocity_score: 0.92
  },
  {
    id: 2,
    acknowledgement_no: '2026MHA001285',
    victim_name: 'Pooja Iyer',
    victim_contact: '+91-98450-11239',
    fraud_category: 'UPI / QR Fraud',
    fraud_amount: 145000,
    incident_timestamp: '2026-08-29T19:10:00Z',
    mule_bank_name: 'HDFC Bank',
    mule_account_no: '50100492819',
    latitude: 28.6200,
    longitude: 77.2150,
    district: 'Central Delhi',
    state: 'Delhi',
    status: 'DISPATCH_ALERTED',
    hop_count: 2,
    velocity_score: 0.88
  },
  {
    id: 3,
    acknowledgement_no: '2026MHA001286',
    victim_name: 'Vikram Mehta',
    victim_contact: '+91-98201-99882',
    fraud_category: 'Stock Market / Trading Scam',
    fraud_amount: 1250000,
    incident_timestamp: '2026-08-29T17:30:00Z',
    mule_bank_name: 'ICICI Bank',
    mule_account_no: '00120593819',
    latitude: 19.0760,
    longitude: 72.8777,
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    status: 'FROZEN_AT_GATEWAY',
    hop_count: 4,
    velocity_score: 0.95
  },
  {
    id: 4,
    acknowledgement_no: '2026MHA001287',
    victim_name: 'Sunita Patil',
    victim_contact: '+91-97640-33211',
    fraud_category: 'OTP Phishing Scam',
    fraud_amount: 98000,
    incident_timestamp: '2026-08-29T19:35:00Z',
    mule_bank_name: 'Axis Bank',
    mule_account_no: '91402003819',
    latitude: 18.5204,
    longitude: 73.8567,
    district: 'Pune',
    state: 'Maharashtra',
    status: 'ACTIVE_INTERVENTION',
    hop_count: 2,
    velocity_score: 0.84
  },
  {
    id: 5,
    acknowledgement_no: '2026MHA001288',
    victim_name: 'Arun Varma',
    victim_contact: '+91-94480-22119',
    fraud_category: 'Task / Part-Time Job Fraud',
    fraud_amount: 320000,
    incident_timestamp: '2026-08-29T18:15:00Z',
    mule_bank_name: 'Kotak Mahindra Bank',
    mule_account_no: '48120093811',
    latitude: 12.9716,
    longitude: 77.5946,
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    status: 'DISPATCH_ALERTED',
    hop_count: 3,
    velocity_score: 0.89
  },
  {
    id: 6,
    acknowledgement_no: '2026MHA001289',
    victim_name: 'Kavitha Reddy',
    victim_contact: '+91-98850-77661',
    fraud_category: 'Investment Scheme Scam',
    fraud_amount: 640000,
    incident_timestamp: '2026-08-29T19:00:00Z',
    mule_bank_name: 'Punjab National Bank',
    mule_account_no: '18290019283',
    latitude: 17.3850,
    longitude: 78.4867,
    district: 'Hyderabad',
    state: 'Telangana',
    status: 'ACTIVE_INTERVENTION',
    hop_count: 2,
    velocity_score: 0.87
  },
  {
    id: 7,
    acknowledgement_no: '2026MHA001290',
    victim_name: 'Dharmesh Patel',
    victim_contact: '+91-98240-55443',
    fraud_category: 'KYC Update / Electricity Scam',
    fraud_amount: 75000,
    incident_timestamp: '2026-08-29T19:40:00Z',
    mule_bank_name: 'Bank of Baroda',
    mule_account_no: '01920038192',
    latitude: 23.0225,
    longitude: 72.5714,
    district: 'Ahmedabad',
    state: 'Gujarat',
    status: 'PRE_ALERT_SENT',
    hop_count: 1,
    velocity_score: 0.79
  },
  {
    id: 8,
    acknowledgement_no: '2026MHA001291',
    victim_name: 'Ananya Sen',
    victim_contact: '+91-98300-11928',
    fraud_category: 'SIM Swap Fraud',
    fraud_amount: 210000,
    incident_timestamp: '2026-08-29T18:50:00Z',
    mule_bank_name: 'Canara Bank',
    mule_account_no: '12093019281',
    latitude: 28.7041,
    longitude: 77.1025,
    district: 'Rohini',
    state: 'Delhi',
    status: 'ACTIVE_INTERVENTION',
    hop_count: 3,
    velocity_score: 0.91
  }
];

export const MOCK_HOTSPOTS = [
  {
    id: 1,
    model_run_id: 104,
    model_version: 'v1.0.4-spatial',
    model_accuracy: 0.942,
    cluster_id: 'DEL-NW-7',
    district: 'Rohini',
    state: 'Delhi',
    center_latitude: 28.7041,
    center_longitude: 77.1025,
    radius_meters: 1600,
    risk_score: 0.942,
    confidence: 0.89,
    alert_tier: 'P1',
    time_window: 'Next 45–60 mins',
    total_complaints_in_cluster: 4,
    total_fraud_volume: 1450000,
    atm_id: 'ATM-DEL-NW-07',
    bank_name: 'State Bank of India',
    atm_address: 'Sector 8 Market Complex, Rohini, New Delhi',
    police_station_name: 'Rohini Cyber Crime Police Station',
    police_contact: '+91-11-27050011',
    actionable_intelligence: 'HIGH RISK CASH WITHDRAWAL FORECAST: Mule account velocity indicates imminent cash extraction at SBI ATM (Sector 8 Rohini). Proximity: 0.35 km. Cluster Vol: ₹14.50 Lakhs. ACTIONABLE LEA DISPATCH: Deploy tactical PCR team to intercept within 45-min golden window.',
    shap_features: [
      { name: 'High Complaint Velocity (1hr)', impact: '+34%', positive: true },
      { name: 'UPI & Digital Arrest Chain', impact: '+22%', positive: true },
      { name: 'Off-site ATM Proximity Pattern', impact: '+18%', positive: true },
      { name: 'Inter-state Layering (MH -> DL)', impact: '+14%', positive: true },
      { name: 'Cardless Withdrawal Signal', impact: '+6%', positive: true }
    ]
  },
  {
    id: 2,
    model_run_id: 104,
    model_version: 'v1.0.4-spatial',
    model_accuracy: 0.942,
    cluster_id: 'DEL-CP-2',
    district: 'New Delhi',
    state: 'Delhi',
    center_latitude: 28.6289,
    center_longitude: 77.2180,
    radius_meters: 1400,
    risk_score: 0.885,
    confidence: 0.84,
    alert_tier: 'P1',
    time_window: 'Next 30–45 mins',
    total_complaints_in_cluster: 3,
    total_fraud_volume: 1050000,
    atm_id: 'ATM-DEL-CP-02',
    bank_name: 'HDFC Bank',
    atm_address: 'Barakhamba Road, Connaught Place, New Delhi',
    police_station_name: 'Connaught Place Cyber Police Station',
    police_contact: '+91-11-23340001',
    actionable_intelligence: 'P1 DISPATCH: HDFC Barakhamba ATM identified as secondary cashout node. Layer-2 mule account received ₹10.50L. Intercept team dispatched with bank branch coordinator alerted.',
    shap_features: [
      { name: 'Hop 2 Cashout Velocity', impact: '+29%', positive: true },
      { name: 'Historical ATM Risk Density', impact: '+25%', positive: true },
      { name: 'Fraud Category: Stock Scam', impact: '+17%', positive: true },
      { name: 'Golden Hour Delta < 40 min', impact: '+15%', positive: true }
    ]
  },
  {
    id: 3,
    model_run_id: 104,
    model_version: 'v1.0.4-spatial',
    model_accuracy: 0.942,
    cluster_id: 'MUM-AND-4',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    center_latitude: 19.1136,
    center_longitude: 72.8697,
    radius_meters: 2200,
    risk_score: 0.834,
    confidence: 0.81,
    alert_tier: 'P2',
    time_window: 'Next 60–90 mins',
    total_complaints_in_cluster: 5,
    total_fraud_volume: 1820000,
    atm_id: 'ATM-MUM-AND-12',
    bank_name: 'ICICI Bank',
    atm_address: 'Andheri East Station Complex, Mumbai',
    police_station_name: 'Andheri Cyber Cell Unit',
    police_contact: '+91-22-26830022',
    actionable_intelligence: 'P2 RISK ZONE: High-density mule account transfers converging at Andheri ICICI ATM cluster. Total fraud pipeline: ₹18.20L. Local bank manager alerted for temporary card blocking.',
    shap_features: [
      { name: 'Multi-mule Aggregation', impact: '+31%', positive: true },
      { name: 'Commercial Transit Hub', impact: '+21%', positive: true },
      { name: 'Task Fraud Category', impact: '+16%', positive: true }
    ]
  },
  {
    id: 4,
    model_run_id: 104,
    model_version: 'v1.0.4-spatial',
    model_accuracy: 0.942,
    cluster_id: 'BLR-KOR-1',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    center_latitude: 12.9352,
    center_longitude: 77.6245,
    radius_meters: 1500,
    risk_score: 0.792,
    confidence: 0.78,
    alert_tier: 'P2',
    time_window: 'Next 75 mins',
    total_complaints_in_cluster: 2,
    total_fraud_volume: 640000,
    atm_id: 'ATM-BLR-KOR-05',
    bank_name: 'Axis Bank',
    atm_address: '80 Feet Road, 4th Block Koramangala, Bengaluru',
    police_station_name: 'Koramangala Cyber Crime Police Station',
    police_contact: '+91-80-22943400',
    actionable_intelligence: 'P2 ALERT: Mule card extraction sequence detected. Pre-alert sent to Axis Bank fraud monitoring desk and Koramangala Cyber Squad.',
    shap_features: [
      { name: 'Card-to-Account Ratio', impact: '+26%', positive: true },
      { name: 'Night-time Withdrawal Trend', impact: '+20%', positive: true },
      { name: 'Telegram Job Scam Link', impact: '+15%', positive: true }
    ]
  }
];

export const MOCK_ATMS = [
  { id: 101, atm_id: 'ATM-DEL-NW-07', bank_name: 'State Bank of India', address: 'Sector 8 Market, Rohini, New Delhi', district: 'Rohini', state: 'Delhi', risk_tier: 'CRITICAL', latitude: 28.7041, longitude: 77.1025, monthly_txn_vol: 1450, atm_type: 'OFF_SITE' },
  { id: 102, atm_id: 'ATM-DEL-CP-02', bank_name: 'HDFC Bank', address: 'Barakhamba Road, Connaught Place, New Delhi', district: 'New Delhi', state: 'Delhi', risk_tier: 'CRITICAL', latitude: 28.6289, longitude: 77.2180, monthly_txn_vol: 1820, atm_type: 'ON_SITE' },
  { id: 103, atm_id: 'ATM-MUM-AND-12', bank_name: 'ICICI Bank', address: 'Station Road, Andheri East, Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', risk_tier: 'HIGH', latitude: 19.1136, longitude: 72.8697, monthly_txn_vol: 1980, atm_type: 'CRA_MANAGED' },
  { id: 104, atm_id: 'ATM-BLR-KOR-05', bank_name: 'Axis Bank', address: '80 Feet Road, Koramangala, Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', risk_tier: 'HIGH', latitude: 12.9352, longitude: 77.6245, monthly_txn_vol: 1240, atm_type: 'OFF_SITE' },
  { id: 105, atm_id: 'ATM-HYD-HIT-03', bank_name: 'Punjab National Bank', address: 'Hitech City Main Road, Hyderabad', district: 'Hyderabad', state: 'Telangana', risk_tier: 'MEDIUM', latitude: 17.4435, longitude: 78.3772, monthly_txn_vol: 1100, atm_type: 'ON_SITE' },
  { id: 106, atm_id: 'ATM-AHM-CG-09', bank_name: 'Bank of Baroda', address: 'CG Road, Navrangpura, Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', risk_tier: 'MEDIUM', latitude: 23.0338, longitude: 72.5630, monthly_txn_vol: 950, atm_type: 'OFF_SITE' },
  { id: 107, atm_id: 'ATM-PUN-FC-01', bank_name: 'Kotak Mahindra Bank', address: 'FC Road, Shivajinagar, Pune', district: 'Pune', state: 'Maharashtra', risk_tier: 'MEDIUM', latitude: 18.5284, longitude: 73.8419, monthly_txn_vol: 1320, atm_type: 'ON_SITE' }
];

export const MOCK_POLICE_STATIONS = [
  { id: 1, station_name: 'Rohini Cyber Crime Police Station', jurisdiction_code: 'PS-DEL-ROH-01', contact_number: '+91-11-27050011', city: 'Delhi NCR', state: 'Delhi', latitude: 28.7090, longitude: 77.1080, pcr_vans_active: 3, officer_in_charge: 'Insp. Rakesh Malik' },
  { id: 2, station_name: 'Connaught Place Cyber Police Station', jurisdiction_code: 'PS-DEL-CP-001', contact_number: '+91-11-23340001', city: 'Delhi NCR', state: 'Delhi', latitude: 28.6280, longitude: 77.2190, pcr_vans_active: 4, officer_in_charge: 'ACP Sunita Meena' },
  { id: 3, station_name: 'Andheri Cyber Cell Unit', jurisdiction_code: 'PS-MH-MUM-AND-04', contact_number: '+91-22-26830022', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1190, longitude: 72.8650, pcr_vans_active: 2, officer_in_charge: 'Sr. PI Vijay Kadam' },
  { id: 4, station_name: 'Koramangala Cyber Police Station', jurisdiction_code: 'PS-KA-BLR-KOR-02', contact_number: '+91-80-22943400', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9300, longitude: 77.6200, pcr_vans_active: 3, officer_in_charge: 'PI Suresh Gowda' },
  { id: 5, station_name: 'Cyberabad Cyber Crimes Unit', jurisdiction_code: 'PS-TG-HYD-CYB-09', contact_number: '+91-40-27853400', city: 'Hyderabad', state: 'Telangana', latitude: 17.4400, longitude: 78.3800, pcr_vans_active: 4, officer_in_charge: 'DCP K. Chandrasekhar' }
];

export const MOCK_MULE_GRAPH = {
  nodes: [
    { id: 'VIC-01', label: 'Victim (Rajesh Sharma)', type: 'VICTIM', amount: 850000, bank: 'Axis Bank', ifsc: 'UTIB0000124', account: '9140200847291', city: 'New Delhi', risk: 0.05 },
    { id: 'MULE-L1', label: 'Mule Layer 1 (Rohit Das)', type: 'MULE_L1', amount: 850000, bank: 'State Bank of India', ifsc: 'SBIN0001294', account: '30981129482', city: 'Jaipur', risk: 0.78 },
    { id: 'MULE-L2-A', label: 'Mule Layer 2A (Karan Verma)', type: 'MULE_L2', amount: 500000, bank: 'HDFC Bank', ifsc: 'HDFC0000492', account: '50100492819', city: 'Delhi', risk: 0.91 },
    { id: 'MULE-L2-B', label: 'Mule Layer 2B (Simran Kaur)', type: 'MULE_L2', amount: 350000, bank: 'ICICI Bank', ifsc: 'ICIC0000012', account: '00120593819', city: 'Noida', risk: 0.86 },
    { id: 'CASHOUT-01', label: 'Cashout Mule (ATM Extraction)', type: 'CASHOUT', amount: 500000, bank: 'State Bank of India ATM', ifsc: 'SBIN-DEL-ROH', account: 'CARD-6071-XXXX', city: 'Rohini (Delhi)', risk: 0.98 }
  ],
  links: [
    { source: 'VIC-01', target: 'MULE-L1', amount: 850000, txn_type: 'IMPS', time: '18:45:12', hop: 1, velocity: '8.4s' },
    { source: 'MULE-L1', target: 'MULE-L2-A', amount: 500000, txn_type: 'UPI / IMPS', time: '18:51:30', hop: 2, velocity: '6.2m' },
    { source: 'MULE-L1', target: 'MULE-L2-B', amount: 350000, txn_type: 'NEFT', time: '18:54:02', hop: 2, velocity: '8.9m' },
    { source: 'MULE-L2-A', target: 'CASHOUT-01', amount: 500000, txn_type: 'ATM_WITHDRAWAL_PENDING', time: 'PREDICTED: 19:30-20:00', hop: 3, velocity: 'IMMINENT' }
  ]
};

export const MOCK_MODEL_METRICS = {
  version: 'v1.0.4-spatial',
  algorithm: 'Ensemble XGBoost + ST-GNN + Spatial DBSCAN',
  training_samples: 50000,
  features_count: 38,
  target_districts: 21,
  target_states: 5,
  top3_district_accuracy: 0.742,
  overall_accuracy: 0.942,
  precision: 0.928,
  recall: 0.951,
  f1_score: 0.9393,
  clusters_identified: 47,
  avg_intercluster_distance: '2.4 km',
  golden_hour_window: '30–90 minutes',
  training_date: '2026-08-28T14:30:00Z'
};

export const MOCK_ALERTS_STREAM = [
  {
    id: 'ALT-2026-0891',
    tier: 'P1',
    category: 'Digital Arrest Scam',
    district: 'Rohini, Delhi NCR',
    atm_id: 'ATM-DEL-NW-07',
    bank: 'State Bank of India',
    target_volume: 1450000,
    risk_score: 0.942,
    window: '45 mins remaining',
    lea_assigned: 'Rohini Cyber Crime Police Station',
    status: 'ACTIVE_DISPATCH',
    timestamp: '2 mins ago'
  },
  {
    id: 'ALT-2026-0890',
    tier: 'P1',
    category: 'Stock Market Scam',
    district: 'New Delhi',
    atm_id: 'ATM-DEL-CP-02',
    bank: 'HDFC Bank',
    target_volume: 1050000,
    risk_score: 0.885,
    window: '30 mins remaining',
    lea_assigned: 'Connaught Place Cyber Police Station',
    status: 'INTERCEPT_PATROL_SENT',
    timestamp: '8 mins ago'
  },
  {
    id: 'ALT-2026-0889',
    tier: 'P2',
    category: 'Task Fraud',
    district: 'Mumbai Suburban',
    atm_id: 'ATM-MUM-AND-12',
    bank: 'ICICI Bank',
    target_volume: 1820000,
    risk_score: 0.834,
    window: '75 mins remaining',
    lea_assigned: 'Andheri Cyber Cell Unit',
    status: 'BANK_PRE_ALERTED',
    timestamp: '14 mins ago'
  },
  {
    id: 'ALT-2026-0888',
    tier: 'P2',
    category: 'Investment Scheme Scam',
    district: 'Bengaluru Urban',
    atm_id: 'ATM-BLR-KOR-05',
    bank: 'Axis Bank',
    target_volume: 640000,
    risk_score: 0.792,
    window: '60 mins remaining',
    lea_assigned: 'Koramangala Cyber Police Station',
    status: 'MONITORING_CRA',
    timestamp: '22 mins ago'
  },
  {
    id: 'ALT-2026-0887',
    tier: 'P3',
    category: 'KYC Phishing',
    district: 'Ahmedabad',
    atm_id: 'ATM-AHM-CG-09',
    bank: 'Bank of Baroda',
    target_volume: 175000,
    risk_score: 0.680,
    window: '90 mins remaining',
    lea_assigned: 'Ahmedabad Cyber Crime Cell',
    status: 'FLAGGED_FOR_AUDIT',
    timestamp: '35 mins ago'
  }
];

export const MOCK_RL_FEEDBACK_LOGS = [
  { id: 1, alert_id: 'ALT-2026-0884', officer: 'Insp. R. Malik (Rohini)', outcome: 'TRUE_POSITIVE_INTERCEPTED', cash_seized: 450000, reward_delta: '+0.045', timestamp: '2026-08-29 16:20' },
  { id: 2, alert_id: 'ALT-2026-0879', officer: 'ACP S. Meena (CP)', outcome: 'FROZEN_BEFORE_CASHOUT', cash_seized: 890000, reward_delta: '+0.062', timestamp: '2026-08-29 14:45' },
  { id: 3, alert_id: 'ALT-2026-0875', officer: 'PI S. Gowda (Koramangala)', outcome: 'FALSE_POSITIVE_MISSED_ATM', cash_seized: 0, reward_delta: '-0.028', timestamp: '2026-08-29 11:30' }
];

export const MOCK_FRAUD_DISTRIBUTION = [
  { name: 'UPI / QR Fraud', count: 32, mha_benchmark: 31.5, color: '#00d2ff' },
  { name: 'Credit Card / ATM Fraud', count: 18, mha_benchmark: 17.8, color: '#3b82f6' },
  { name: 'Phishing / Smishing', count: 15, mha_benchmark: 14.5, color: '#8b5cf6' },
  { name: 'Investment / Trading Scam', count: 12, mha_benchmark: 12.2, color: '#ffa502' },
  { name: 'Digital Arrest / Extortion', count: 10, mha_benchmark: 8.5, color: '#ff4757' },
  { name: 'SIM Swap / KYC Fraud', count: 8, mha_benchmark: 9.0, color: '#2ed573' },
  { name: 'Task / Job Scam', count: 5, mha_benchmark: 6.5, color: '#e056fd' }
];

export const MOCK_HOURLY_CASHOUT_PATTERNS = [
  { hour: '00:00', volume_lakhs: 4.2, attempts: 18 },
  { hour: '03:00', volume_lakhs: 2.1, attempts: 9 },
  { hour: '06:00', volume_lakhs: 5.8, attempts: 24 },
  { hour: '09:00', volume_lakhs: 18.4, attempts: 82 },
  { hour: '11:00', volume_lakhs: 38.6, attempts: 165 },
  { hour: '13:00', volume_lakhs: 42.1, attempts: 194 },
  { hour: '15:00', volume_lakhs: 31.5, attempts: 142 },
  { hour: '17:00', volume_lakhs: 46.8, attempts: 210 },
  { hour: '19:00', volume_lakhs: 52.4, attempts: 248 },
  { hour: '21:00', volume_lakhs: 35.2, attempts: 155 },
  { hour: '23:00', volume_lakhs: 14.7, attempts: 68 }
];

export const MOCK_STATE_COMPARISON = [
  { state: 'Delhi NCR', complaints: 1420, predicted_hotspots: 14, recovery_rate_proactive: 79.4, baseline_rate: 22.1 },
  { state: 'Maharashtra', complaints: 1890, predicted_hotspots: 16, recovery_rate_proactive: 81.2, baseline_rate: 24.5 },
  { state: 'Karnataka', complaints: 1150, predicted_hotspots: 9, recovery_rate_proactive: 76.8, baseline_rate: 21.0 },
  { state: 'Telangana', complaints: 980, predicted_hotspots: 8, recovery_rate_proactive: 82.5, baseline_rate: 23.8 },
  { state: 'Gujarat', complaints: 840, predicted_hotspots: 6, recovery_rate_proactive: 74.3, baseline_rate: 19.5 }
];
