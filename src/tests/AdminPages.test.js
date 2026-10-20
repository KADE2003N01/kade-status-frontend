import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ADMIN_NOTIFICATION_EVENT,
    apiRequest,
    formatFieldLabel,
    responseJson,
    updateNestedValue
} from '../pages/admin/AdminPages.jsx';
import { apiFetch } from '../services/api.js';

vi.mock('../services/api.js', () => ({
    apiFetch: vi.fn()
}));

function jsonResponse(body, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        json: async () => body,
        clone() {
            return jsonResponse(body, { ok, status });
        }
    };
}

beforeEach(() => {
    vi.stubGlobal('window', {
        location: { replace: vi.fn() },
        dispatchEvent: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    });
    document.body.classList.remove('auth-pending');
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('updateNestedValue', () => {
    it('sets a nested value without mutating the original', () => {
        const original = { hero: { title: 'Hello', visible: true } };
        const next = updateNestedValue(original, ['hero', 'title'], 'World');
        expect(next).toEqual({ hero: { title: 'World', visible: true } });
        expect(original).toEqual({ hero: { title: 'Hello', visible: true } });
    });

    it('sets deeply nested values including array indices', () => {
        const original = { footer: { socialLinks: [{ label: 'GitHub', href: 'https://x' }] } };
        const next = updateNestedValue(original, ['footer', 'socialLinks', 0, 'label'], 'GitLab');
        expect(next.footer.socialLinks[0].label).toBe('GitLab');
        expect(original.footer.socialLinks[0].label).toBe('GitHub');
    });

    it('keeps sibling keys intact', () => {
        const original = { adminName: 'David', hero: { subtitle: 'kept', title: 'old' } };
        const next = updateNestedValue(original, ['hero', 'title'], 'new');
        expect(next.adminName).toBe('David');
        expect(next.hero.subtitle).toBe('kept');
    });

    it('throws a descriptive error when an intermediate path segment is missing', () => {
        const original = { hero: { title: 'Hello' } };
        expect(() => updateNestedValue(original, ['missing', 'title'], 'x'))
            .toThrowError(/Cannot set .*missing/);
    });
});

describe('formatFieldLabel', () => {
    it('splits camelCase keys into spaced labels', () => {
        expect(formatFieldLabel('heroTitle')).toBe('Hero Title');
    });

    it('splits consecutive capitals before a final word', () => {
        expect(formatFieldLabel('CVDocument')).toBe('CV Document');
    });

    it('capitalizes the first letter of a lowercase key', () => {
        expect(formatFieldLabel('visible')).toBe('Visible');
    });

    it('leaves already-spaced words readable', () => {
        expect(formatFieldLabel('social links')).toBe('Social links');
    });
});

describe('responseJson', () => {
    it('returns the parsed body for a successful response', async () => {
        const response = jsonResponse({ documents: [] });
        await expect(responseJson(response, 'fallback')).resolves.toEqual({ documents: [] });
    });

    it('throws the server error message for a failed response', async () => {
        const response = jsonResponse({ error: 'Could not save.' }, { ok: false, status: 400 });
        await expect(responseJson(response, 'fallback')).rejects.toThrow('Could not save.');
    });

    it('falls back to the caller message when the body has no error field', async () => {
        const response = jsonResponse({}, { ok: false, status: 500 });
        await expect(responseJson(response, 'Something broke.')).rejects.toThrow('Something broke.');
    });
});

describe('apiRequest', () => {
    function notificationEvents() {
        return window.dispatchEvent.mock.calls
            .map(([event]) => event)
            .filter((event) => event?.type === ADMIN_NOTIFICATION_EVENT)
            .map((event) => event.detail);
    }

    it('sends JSON content-type for string bodies and returns the response', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ success: true }));
        const response = await apiRequest('/homepage', { method: 'PUT', body: JSON.stringify({ a: 1 }) });
        expect(response.ok).toBe(true);
        expect(apiFetch).toHaveBeenCalledWith('/homepage', expect.objectContaining({
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        }));
    });

    it('does not add a content-type header for non-string bodies', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ success: true }));
        await apiRequest('/homepage', { method: 'GET' });
        expect(apiFetch.mock.calls[0][1].headers).toBeUndefined();
    });

    it('notifies success for non-GET requests', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ success: true }));
        await apiRequest('/downloads/abc', { method: 'DELETE' });
        expect(notificationEvents()).toEqual([
            { message: 'Download request deleted successfully.', tone: 'success' }
        ]);
    });

    it('does not notify for GET requests', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ downloads: [] }));
        await apiRequest('/downloads');
        expect(notificationEvents()).toEqual([]);
    });

    it('notifies the server error for a failed non-GET request', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ error: 'Validation failed.' }, { ok: false, status: 400 }));
        await apiRequest('/homepage', { method: 'PUT', body: '{}' });
        expect(notificationEvents()).toEqual([
            { message: 'Validation failed.', tone: 'error' }
        ]);
    });

    it('rejects with the session-expiry error on a 401 response', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ error: 'Session expired.' }, { ok: false, status: 401 }));
        await expect(apiRequest('/homepage', { method: 'PUT', body: '{}' }))
            .rejects.toThrow('Your admin session has expired. Sign in again to continue.');
        expect(window.location.replace).toHaveBeenCalledWith('admin-login.html');
        expect(notificationEvents()[0]).toEqual({ message: 'Session expired.', tone: 'error' });
    });

    it('suppresses notifications when silentNotification is set', async () => {
        apiFetch.mockResolvedValue(jsonResponse({ success: true }));
        await apiRequest('/homepage', { method: 'PUT', body: '{}', silentNotification: true });
        expect(notificationEvents()).toEqual([]);
    });

    it('notifies a fallback message when the fetch itself fails', async () => {
        apiFetch.mockRejectedValue(new Error('Network down'));
        await expect(apiRequest('/homepage', { method: 'PUT', body: '{}' })).rejects.toThrow('Network down');
        expect(notificationEvents()).toEqual([{ message: 'Network down', tone: 'error' }]);
    });
});
