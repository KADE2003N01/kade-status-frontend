export function getStoredSessionToken() {
  try { return window.sessionStorage.getItem('kade-admin-session-token') || ''; } catch { return ''; }
}

export function storeSessionToken(token) {
  try {
    if (token) window.sessionStorage.setItem('kade-admin-session-token', token);
    else window.sessionStorage.removeItem('kade-admin-session-token');
  } catch { /* The HTTP-only cookie remains the primary session. */ }
}
