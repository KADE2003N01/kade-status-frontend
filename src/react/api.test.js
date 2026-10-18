import { afterEach, describe, expect, it, vi } from 'vitest';

describe('resolveApiAssetUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('moves stale localhost image URLs to the public API when the site is deployed', async () => {
    vi.stubGlobal('window', { location: { hostname: 'portfolio.example.com' } });
    const { resolveApiAssetUrl } = await import('./api.js');
    const path = '/api/homepage/profile-image/profile-example.jpg';

    expect(resolveApiAssetUrl(`http://localhost:5000${path}`))
      .toBe(`https://kade-status-backend-e1th.onrender.com${path}`);
  });

  it('keeps localhost image URLs for local development', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } });
    const { resolveApiAssetUrl } = await import('./api.js');

    expect(resolveApiAssetUrl('http://localhost:5000/api/homepage/profile-image/profile-example.jpg'))
      .toBe('http://localhost:5000/api/homepage/profile-image/profile-example.jpg');
  });
});
