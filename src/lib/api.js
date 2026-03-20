const TOKEN_KEY = 'drishti_token';
export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function login(credentials) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  setStoredToken(data.token);
  return data;
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}

export function getBootstrap() {
  return request('/api/bootstrap');
}

export async function uploadScan(form) {
  const body = new FormData();
  body.append('patientId', form.patientId);
  body.append('patientName', form.patientName);
  body.append('age', form.age);
  body.append('gender', form.gender || '-');
  body.append('eye', form.eye || 'OD');
  if (form.fundusImage) body.append('fundusImage', form.fundusImage);

  return request('/api/scans/upload', {
    method: 'POST',
    body,
    headers: {},
  });
}

export function savePatientReport(patientId, report) {
  return request(`/api/patients/${patientId}/report`, {
    method: 'PATCH',
    body: JSON.stringify({ report }),
  });
}

export function updateReviewStatus(patientId, reviewStatus) {
  return request(`/api/patients/${patientId}/review-status`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewStatus }),
  });
}

export function updateSettings(settings) {
  return request('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}
