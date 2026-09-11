export const FIELD_OFFICERS = [
  {
    id: "FO-DEL-001",
    name: "Constable Ravi Kumar",
    firstName: "Ravi",
    lastName: "Kumar",
    badge: "DL/CY/1204",
    rank: "Constable",
    unit: "Rohini Sector 14 Patrol",
    district: "Rohini",
    state: "Delhi",
    assignedAtm: "ATM-DEL-NW-07",
    atmAddress: "Sector 8 Market Complex, Rohini, New Delhi",
    bank: "State Bank of India",
    latitude: 28.7041,
    longitude: 77.1025,
    shift: "08:00 – 20:00",
    phone: "+91-11-27050011",
    avatar: "RK",
    color: "#00e5ff",
    pin: "1204",
    role: "field_officer",
  },
  {
    id: "FO-DEL-002",
    name: "HC Priya Sharma",
    firstName: "Priya",
    lastName: "Sharma",
    badge: "DL/CY/0892",
    rank: "Head Constable",
    unit: "Connaught Place Patrol",
    district: "New Delhi",
    state: "Delhi",
    assignedAtm: "ATM-DEL-CP-02",
    atmAddress: "Connaught Place Market, Central Delhi",
    bank: "HDFC Bank",
    latitude: 28.6289,
    longitude: 77.218,
    shift: "20:00 – 08:00",
    phone: "+91-11-23412345",
    avatar: "PS",
    color: "#a855f7",
    pin: "0892",
    role: "field_officer",
  },
  {
    id: "FO-MUM-001",
    name: "SI Rohit Desai",
    firstName: "Rohit",
    lastName: "Desai",
    badge: "MH/CY/3311",
    rank: "Sub Inspector",
    unit: "Andheri East Patrol",
    district: "Mumbai Suburban",
    state: "Maharashtra",
    assignedAtm: "ATM-MUM-AN-03",
    atmAddress: "Andheri East Station Road, Mumbai",
    bank: "ICICI Bank",
    latitude: 19.1196,
    longitude: 72.8468,
    shift: "08:00 – 20:00",
    phone: "+91-22-26834000",
    avatar: "RD",
    color: "#00e676",
    pin: "3311",
    role: "field_officer",
  },
];

export const INVESTIGATORS = [
  {
    id: "INV-DEL-001",
    name: "Insp. Rakesh Malik",
    firstName: "Rakesh",
    lastName: "Malik",
    badge: "DL/CYB/8842",
    rank: "Inspector",
    unit: "Special Cyber Cell, Delhi",
    district: "Rohini",
    state: "Delhi",
    phone: "+91-11-27050011",
    avatar: "RM",
    color: "#a855f7",
    pin: "8842",
    role: "investigator",
  },
  {
    id: "INV-DEL-002",
    name: "ACP Sunita Meena",
    firstName: "Sunita",
    lastName: "Meena",
    badge: "DL/CYB/2201",
    rank: "Assistant Commissioner of Police",
    unit: "Connaught Place Cyber Police Station",
    district: "New Delhi",
    state: "Delhi",
    phone: "+91-11-23340001",
    avatar: "SM",
    color: "#c084fc",
    pin: "2201",
    role: "investigator",
  },
  {
    id: "INV-BLR-001",
    name: "PI Suresh Gowda",
    firstName: "Suresh",
    lastName: "Gowda",
    badge: "KA/CYB/4418",
    rank: "Police Inspector",
    unit: "Koramangala Cyber Police Station",
    district: "Bengaluru",
    state: "Karnataka",
    phone: "+91-80-22943400",
    avatar: "SG",
    color: "#3b82f6",
    pin: "4418",
    role: "investigator",
  },
];

const normalizeBadge = (value = "") =>
  String(value).replace(/[\s-]/g, "").toUpperCase();

export function findPersonnelByBadge(roster, badge) {
  const key = normalizeBadge(badge);
  if (!key) return null;
  return roster.find((person) => normalizeBadge(person.badge) === key) || null;
}

export function verifyPersonnelPin(person, pin) {
  if (!person) return false;
  const entered = String(pin || "").trim();
  return entered === person.pin;
}
