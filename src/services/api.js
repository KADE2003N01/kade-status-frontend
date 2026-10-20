const configuredApiUrl = import.meta.env.VITE_PORTFOLIO_API_BASE_URL;
const liveApiUrl = 'https://kade-status-backend-e1th.onrender.com/api';
const { hostname } = window.location;
const localApiHost = hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
const localApiUrl = `http://${localApiHost}:5000/api`;
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
const defaultApiUrls = isLocalHost
  ? [localApiUrl]
  : ['/api', liveApiUrl];

export const API_BASE_URLS = [...new Set([
  configuredApiUrl,
  ...defaultApiUrls
].filter((url) => typeof url === 'string' && url.trim())
  .map((url) => url.trim().replace(/\/+$/, '')))];

export const API_BASE_URL = API_BASE_URLS[0];

/** Resolve API hosted assets independently of the page host. <img> requests do
 * not pass through apiFetch's API fallback, so relative /api URLs can otherwise
 * point at a static frontend host that does not proxy them. */
export function resolveApiAssetUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const candidate = value.trim();
  const localHost = (hostname) => ['localhost', '127.0.0.1', '::1'].includes(hostname.toLowerCase());
  const isLocalPage = localHost(window.location.hostname);
  const publicApiBase = API_BASE_URLS.find((baseUrl) => {
    if (!/^https?:\/\//i.test(baseUrl)) return false;
    try { return !localHost(new URL(baseUrl).hostname); } catch { return false; }
  });
  const directApiBase = publicApiBase || API_BASE_URLS.find((baseUrl) => /^https?:\/\//i.test(baseUrl));

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      if (!isLocalPage && localHost(url.hostname) && url.pathname.startsWith('/api/') && publicApiBase) {
        return `${publicApiBase}${url.pathname.slice(4)}${url.search}${url.hash}`;
      }
      return candidate;
    } catch { return ''; }
  }
  if (!candidate.startsWith('/api/')) return candidate;
  return directApiBase ? `${directApiBase}${candidate.slice(4)}` : candidate;
}

export async function apiFetch(path, options) {
  let lastError;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      const contentType = response.headers.get('content-type') || '';

      // A Render static site without its /api rewrite can return the frontend
      // HTML shell with status 200. Treat that as a proxy miss and try the
      // backend URL; keep normal JSON auth errors (including 401) authoritative.
      if (!contentType.toLowerCase().includes('application/json')) {
        lastError = new Error(`The API route at ${baseUrl} returned a non-JSON response.`);
        continue;
      }
      return response;
    } catch (error) {
      if (!(error instanceof TypeError) || options?.signal?.aborted) throw error;
      lastError = error;
    }
  }

  if (isLocalHost && !configuredApiUrl && lastError instanceof TypeError) {
    throw new Error(`Cannot connect to the local backend at ${localApiUrl}. Start it from kade-status-backend with npm start.`);
  }

  throw lastError || new Error('The API did not return a JSON response.');
}
