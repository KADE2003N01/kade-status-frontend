const configuredApiUrl = import.meta.env.VITE_PORTFOLIO_API_BASE_URL;
const { hostname, origin } = window.location;
const localApiHost = hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
const defaultApiBase = isLocalHost
  ? import.meta.env.DEV ? '/api' : `http://${localApiHost}:5000/api`
  : `${origin}/api`;

export const API_BASE_URL = configuredApiUrl || defaultApiBase;
