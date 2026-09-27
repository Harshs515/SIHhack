// sessionRegistry.js
// In-memory session store — simulates the payment network's session registry
// In production: this would be an API call to NPCI/bank's fraud detection API

const sessions = new Map()

// High-risk destination locations (matching TRINETRA's MULE_HOTSPOTS)
const MULE_LOCATIONS = [
  { state: 'Jharkhand',     district: 'Jamtara',     lat: 23.9627, lng: 86.8053 },
  { state: 'Jharkhand',     district: 'Deoghar',     lat: 24.4853, lng: 86.6944 },
  { state: 'Uttar Pradesh', district: 'Mathura',     lat: 27.4924, lng: 77.6737 },
  { state: 'Uttar Pradesh', district: 'Agra',        lat: 27.1767, lng: 78.0081 },
  { state: 'Rajasthan',     district: 'Bharatpur',   lat: 27.2152, lng: 77.4938 },
  { state: 'Bihar',         district: 'Nawada',      lat: 24.8874, lng: 85.5438 },
  { state: 'West Bengal',   district: 'Murshidabad', lat: 24.1760, lng: 88.2690 },
  { state: 'Haryana',       district: 'Mewat',       lat: 28.0283, lng: 77.0138 },
  { state: 'Delhi',         district: 'Rohini',      lat: 28.7041, lng: 77.0780 },
  { state: 'Maharashtra',   district: 'Thane',       lat: 19.2183, lng: 72.9781 },
]

const BANKS = [
  'SBIN', 'HDFC', 'ICIC', 'UTIB', 'PUNB', 'BARB', 'CNRB', 'UBIN'
]

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

// Create a new session (called when complaint is filed with a transaction ID)
function createSession(transactionId, victimLat, victimLng, fraudAmount) {
  const now = new Date()
  const destination = randomChoice(MULE_LOCATIONS)
  const bankCode = randomChoice(BANKS) + Math.floor(1000000 + Math.random() * 9000000)

  // Simulate session age — fraud happened before complaint was filed
  // Filing lag is typically 30 minutes to 4 hours after incident
  const filingLagMinutes = Math.floor(randomBetween(20, 240))
  const sessionCreatedAt = new Date(now.getTime() - filingLagMinutes * 60000)

  // Last activity — could be a balance check by the mule after receiving
  const lastActivityDeltaMinutes = Math.floor(randomBetween(2, 45))
  const lastActivityAt = new Date(now.getTime() - lastActivityDeltaMinutes * 60000)

  const session = {
    session_id:               `TXN-SID-${now.toISOString().slice(0,10).replace(/-/g,'')}-${transactionId.slice(-8).toUpperCase()}`,
    transaction_id:           transactionId,
    session_status:           'ACTIVE',
    session_created_at:       sessionCreatedAt.toISOString(),
    session_expires_at:       new Date(sessionCreatedAt.getTime() + 48 * 60 * 60000).toISOString(),
    session_age_minutes:      filingLagMinutes,

    // Source (victim) info
    source_device_id:         `DEV-${Math.random().toString(36).substr(2,12).toUpperCase()}`,
    source_ip:                `${Math.floor(randomBetween(1,254))}.${Math.floor(randomBetween(1,254))}.${Math.floor(randomBetween(1,254))}.${Math.floor(randomBetween(1,254))}`,
    source_lat:               victimLat,
    source_lng:               victimLng,
    source_os:                randomChoice(['Android 13', 'Android 14', 'iOS 17', 'Android 12']),
    source_app:               randomChoice(['PhonePe', 'GPay', 'Paytm', 'BHIM', 'NetBanking']),

    // Network routing
    hop_count:                Math.floor(randomBetween(3, 9)),
    dns_query_domain:         randomChoice(['upi.npci.org.in', 'api.paytm.com', 'gw.phonepe.com', 'api.bhimupi.org.in']),

    // Destination (mule) info — this is what powers better prediction
    destination_bank_code:    bankCode,
    destination_bank_name:    BANKS.find(b => bankCode.startsWith(b)) || 'SBI',
    destination_account_hash: `****${Math.floor(1000 + Math.random() * 9000)}`,
    destination_ip:           `${Math.floor(randomBetween(1,254))}.${Math.floor(randomBetween(1,254))}.${Math.floor(randomBetween(1,254))}.${Math.floor(randomBetween(1,254))}`,
    destination_lat:          destination.lat + (Math.random() - 0.5) * 0.05,
    destination_lng:          destination.lng + (Math.random() - 0.5) * 0.05,
    destination_state:        destination.state,
    destination_district:     destination.district,

    // Activity tracking
    last_activity_at:         lastActivityAt.toISOString(),
    last_activity_delta_minutes: lastActivityDeltaMinutes,
    last_activity_type:       randomChoice(['BALANCE_CHECK', 'MINI_STATEMENT', 'ATM_PROXIMITY_PING', 'SESSION_REFRESH']),

    // Risk indicators
    is_cross_state:           destination.state !== 'Maharashtra', // assuming victim from Maharashtra
    amount:                   fraudAmount,
    is_round_amount:          fraudAmount % 1000 < 50 ? 1 : 0,
  }

  sessions.set(transactionId, session)
  return session
}

function getSession(transactionId) {
  return sessions.get(transactionId) || null
}

function getAllSessions() {
  return Array.from(sessions.values())
}

module.exports = { createSession, getSession, getAllSessions }