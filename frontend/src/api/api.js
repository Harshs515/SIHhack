const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

function queryString(params = {}) {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function submitComplaint(formData) {
  return request('/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

export function getComplaints(params) {
  return request(`/complaints${queryString(params)}`);
}

export function trackComplaint(ackNo) {
  return request(`/complaints/${encodeURIComponent(ackNo)}`);
}

export function getHotspots(params) {
  return request(`/predictions/hotspots${queryString(params)}`);
}

export function getStats() {
  return request('/predictions/stats');
}

export function getAtms() {
  return request('/predictions/atms');
}

export function getPoliceStations() {
  return request('/predictions/police-stations');
}

export function acknowledgeAlert(id, officerName) {
  return request(`/predictions/${encodeURIComponent(id)}/acknowledge`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ officerName }),
  });
}