const configuredApiUrl = import.meta.env.VITE_PORTFOLIO_API_BASE_URL;
const liveApiUrl = 'https://kade-status-backend-e1th.onrender.com/api';
const { hostname } = window.location;
const localApiHost = hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
const localApiUrl = `http://${localApiHost}:5000/api`;
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
const defaultApiUrls = isLocalHost
  ? [localApiUrl, liveApiUrl]
  : [liveApiUrl];

export const API_BASE_URLS = [...new Set([
  configuredApiUrl,
  ...defaultApiUrls
].filter((url) => typeof url === 'string' && url.trim())
  .map((url) => url.trim().replace(/\/+$/, '')))];

export const API_BASE_URL = API_BASE_URLS[0];

export async function apiFetch(path, options) {
  let lastNetworkError;

  for (const baseUrl of API_BASE_URLS) {
    try {
      return await fetch(`${baseUrl}${path}`, options);
    } catch (error) {
      if (!(error instanceof TypeError) || options?.signal?.aborted) throw error;
      lastNetworkError = error;
    }
  }

  throw lastNetworkError;
}
