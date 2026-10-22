import { apiFetch } from '../../services/api.js';

function getSessionToken() {
  try { return window.sessionStorage.getItem('kade-admin-session-token') || ''; } catch { return ''; }
}

export async function platformOwnerRequest(path, options = {}) {
  const token = getSessionToken();
  const response = await apiFetch(`/platform-owner${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The owner action could not be completed.');
  return result;
}
