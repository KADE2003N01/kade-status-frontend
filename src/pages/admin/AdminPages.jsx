import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch, resolveApiAssetUrl } from '../../services/api.js';
import TimedNotification from '../../components/TimedNotification.jsx';
import LanguageSelector from '../../components/LanguageSelector.jsx';
import PhoneNumberField, { isValidEastAfricanPhone } from '../../components/PhoneNumberField.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const ADMIN_LOGIN_URL = 'admin-login.html';
const AdminSessionContext = createContext(null);
const ADMIN_NOTIFICATION_EVENT = 'kade-admin-notification';
const ADMIN_PROFILE_IMAGE_UPDATED = 'kade-admin-profile-image-updated';

export { ADMIN_NOTIFICATION_EVENT };

function notifyAdmin(message, tone = 'success') {
    window.dispatchEvent(new CustomEvent(ADMIN_NOTIFICATION_EVENT, { detail: { message, tone } }));
}

function actionSuccessMessage(method, path) {
    if (path === '/homepage' && method === 'PUT') return 'Homepage changes published successfully.';
    if (path === '/homepage/reset') return 'Homepage defaults restored successfully.';
    if (path === '/homepage/profile-image') return 'Profile image published successfully.';
    if (path === '/documents/cv') return 'CV published successfully.';
    if (path.startsWith('/documents/certificates')) return method === 'PUT' ? 'Certificate updated successfully.' : 'Certificate saved successfully.';
    if (path.startsWith('/documents/') && method === 'DELETE') return 'Document deleted successfully.';
    if (path.startsWith('/downloads/') && method === 'DELETE') return 'Download request deleted successfully.';
    if (path === '/auth/logout') return 'Signed out successfully.';
    return 'Changes saved successfully.';
}

// Fallback auth token for browsers that block third-party cookies (mobile).
// The httpOnly cookie remains the primary session mechanism; this only kicks
// in when the cookie was rejected.
export function getStoredSessionToken() {
    try { return window.sessionStorage.getItem('kade-admin-session-token') || ''; } catch { return ''; }
}

export function storeSessionToken(token) {
    try {
        if (token) window.sessionStorage.setItem('kade-admin-session-token', token);
        else window.sessionStorage.removeItem('kade-admin-session-token');
    } catch { /* Storage unavailable — cookie-only session. */ }
}

export async function apiRequest(path, options = {}) {
    const { silentNotification = false, ...requestOptions } = options;
    const method = (requestOptions.method || 'GET').toUpperCase();
    let response;
    try {
        const baseHeaders = requestOptions.body && typeof requestOptions.body === 'string'
            ? { 'Content-Type': 'application/json', ...requestOptions.headers }
            : requestOptions.headers;
        const sessionToken = getStoredSessionToken();
        response = await apiFetch(path, {
            ...requestOptions,
            credentials: 'include',
            headers: sessionToken && !baseHeaders?.Authorization
                ? { ...baseHeaders, Authorization: `Bearer ${sessionToken}` }
                : baseHeaders
        });
    } catch (error) {
        if (method !== 'GET' && !silentNotification) notifyAdmin(displayError(error, 'The action could not be completed.'), 'error');
        throw error;
    }

    if (method !== 'GET' && !silentNotification) {
        if (response.ok) {
            notifyAdmin(actionSuccessMessage(method, path), 'success');
        } else {
            const result = await response.clone().json().catch(() => ({}));
            notifyAdmin(result.error || 'The action could not be completed.', 'error');
        }
    }

    if (response.status === 401) {
        window.location.replace(ADMIN_LOGIN_URL);
        throw new Error('Your admin session has expired. Sign in again to continue.');
    }
    return response;
}

export async function responseJson(response, fallbackMessage) {
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || fallbackMessage);
    return result;
}

function displayError(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
}

function describePublishError(error) {
    const message = displayError(error, 'The server could not publish the homepage.');
    const field = message.match(/\bcontent(?:\.[A-Za-z0-9_-]+)+(?:\[[^\]]+\])*/)?.[0];
    return field
        ? `Could not publish. Problem field: ${field}. ${message}`
        : `Could not publish the homepage. ${message}`;
}

export function formatFieldLabel(key) {
    return key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDateTime(value, includeSeconds = false) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        ...(includeSeconds ? { second: '2-digit' } : {}),
        timeZoneName: 'short'
    }).format(date);
}

function useAdminSession() {
    const [session, setSession] = useState(null);
    const [ready, setReady] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const response = await apiFetch('/auth/me', {
                    credentials: 'include',
                    headers: getStoredSessionToken() ? { Authorization: `Bearer ${getStoredSessionToken()}` } : undefined
                });
                if (response.status === 401) {
                    storeSessionToken('');
                    window.location.replace(ADMIN_LOGIN_URL);
                    return;
                }
                const result = await responseJson(response, 'The admin session could not be verified.');
                const displayName = typeof result.user?.displayName === 'string' ? result.user.displayName.trim() : '';
                const email = typeof result.user?.email === 'string' ? result.user.email.trim() : '';
                if (!displayName || !email) throw new Error('The admin profile is missing a name or email address.');
                if (active) {
                    setSession({ displayName, email });
                    document.body.classList.remove('auth-pending');
                }
            } catch (error) {
                console.error('Could not verify the admin session:', error);
                window.location.replace(`${ADMIN_LOGIN_URL}?session=unavailable`);
            } finally {
                if (active) setReady(true);
            }
        })();
        return () => { active = false; };
    }, []);

    const logout = useCallback(async () => {
        setLoggingOut(true);
        setLogoutError('');
        try {
            const response = await apiRequest('/auth/logout', { method: 'POST' });
            if (!response.ok) throw new Error('The server could not end this admin session.');
            storeSessionToken('');
            window.location.replace(ADMIN_LOGIN_URL);
        } catch (error) {
            console.error('Admin logout failed:', error);
            setLogoutError('Could not log out. Check the connection and try again.');
            setLoggingOut(false);
        }
    }, []);

    return { session, ready, logout, logoutError, loggingOut };
}

function useAdminDownloads(enabled = true) {
    const [downloads, setDownloads] = useState([]);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const refresh = useCallback(async (quiet = false) => {
        if (!enabled) return;
        if (!quiet) setRefreshing(true);
        setError('');
        try {
            const response = await apiRequest('/downloads');
            const result = await responseJson(response, 'Could not load download requests.');
            setDownloads(Array.isArray(result.downloads) ? result.downloads : []);
            setLastUpdated(formatDateTime(new Date()));
            if (!quiet) notifyAdmin('Download requests refreshed successfully.', 'success');
        } catch (requestError) {
            console.error('Could not load download requests:', requestError);
            setError(displayError(requestError, 'Could not load download requests. Check the server connection and retry.'));
            if (!quiet) notifyAdmin(displayError(requestError, 'Could not refresh download requests.'), 'error');
        } finally {
            if (!quiet) setRefreshing(false);
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return undefined;
        refresh(true);
        const intervalId = window.setInterval(() => {
            if (!document.hidden) refresh(true);
        }, 30000);
        const onVisibilityChange = () => {
            if (!document.hidden) refresh(true);
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [enabled, refresh]);

    return { downloads, error, setError, lastUpdated, refreshing, refresh };
}

function useAdminClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const intervalId = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(intervalId);
    }, []);
    return now;
}

function AdminThemeToggle() {
    const { t } = useLanguage();
    const [light, setLight] = useState(() => {
        try {
            return window.localStorage.getItem('theme') !== 'dark';
        } catch {
            return true;
        }
    });
    useEffect(() => {
        document.documentElement.classList.toggle('dark-theme', !light);
        document.documentElement.classList.toggle('light-theme', light);
        try {
            window.localStorage.setItem('theme', light ? 'light' : 'dark');
        } catch {
            // Theme still works for the current page when storage is unavailable.
        }
    }, [light]);
    return (
        <button className="theme-toggle admin-theme-toggle" id="admin-theme-toggle" aria-label={t(light ? 'Switch to dark mode' : 'Switch to light mode')} type="button" title={t(light ? 'Switch to dark mode' : 'Switch to light mode')} onClick={() => setLight((value) => !value)}>
            <i className={`fas ${light ? 'fa-moon' : 'fa-sun'}`} aria-hidden="true" />
            <span>{light ? t('Dark') : t('Light')}</span>
        </button>
    );
}

function useAdminProfileImage() {
    const [profileImage, setProfileImage] = useState('');
    const objectUrl = useRef('');
    const loadProfileImage = useCallback(async () => {
        try {
            const privateResponse = await apiRequest('/homepage/admin-profile-image', { silentNotification: true });
            if (privateResponse.ok) {
                const nextUrl = URL.createObjectURL(await privateResponse.blob());
                if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                objectUrl.current = nextUrl;
                setProfileImage(nextUrl);
                return;
            }
            if (privateResponse.status === 204) {
                if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                objectUrl.current = '';
                setProfileImage('');
                return;
            }
            if (privateResponse.status !== 404) throw new Error('Could not load the admin profile image.');
            const response = await apiRequest('/homepage', { silentNotification: true });
            const result = await responseJson(response, 'Could not load the profile image.');
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = '';
            const imageUrl = result.content?.brand?.imageUrl;
            setProfileImage(typeof imageUrl === 'string' && imageUrl && !imageUrl.includes('media/') ? resolveApiAssetUrl(imageUrl) : '');
        } catch (error) {
            console.error('Could not load the profile image:', error);
        }
    }, []);
    useEffect(() => {
        loadProfileImage();
        window.addEventListener(ADMIN_PROFILE_IMAGE_UPDATED, loadProfileImage);
        return () => {
            window.removeEventListener(ADMIN_PROFILE_IMAGE_UPDATED, loadProfileImage);
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        };
    }, [loadProfileImage]);
    return profileImage;
}

function AdminFrame({ session, logout, logoutError, loggingOut, active, downloadCount, children }) {
    const { t } = useLanguage();
    const [notification, setNotification] = useState(null);
    const [publishedDocumentCount, setPublishedDocumentCount] = useState(0);
    const [adminAccountCount, setAdminAccountCount] = useState(null);
    const dismissNotification = useCallback(() => setNotification(null), []);
    const initials = session.displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    const profileImage = useAdminProfileImage();
    useEffect(() => {
        let active = true;
        apiRequest('/documents')
            .then((response) => responseJson(response, 'Could not load document counts.'))
            .then((result) => {
                if (!active) return;
                const documents = Array.isArray(result.documents) ? result.documents : [];
                setPublishedDocumentCount(documents.filter((item) => item.type === 'cv' || item.type === 'certificate').length);
            })
            .catch((error) => console.error('Could not load the document count:', error));
        return () => { active = false; };
    }, []);
    useEffect(() => {
        let active = true;
        apiRequest('/auth/admin-users')
            .then((response) => responseJson(response, 'Could not load administrator account count.'))
            .then((result) => {
                if (active) setAdminAccountCount(Array.isArray(result.admins) ? result.admins.length : 0);
            })
            .catch((error) => console.error('Could not load administrator account count:', error));
        return () => { active = false; };
    }, []);
    const links = [
        { id: 'overview', href: 'admin.html', icon: 'fa-chart-pie', text: 'Overview' },
        { id: 'downloads', href: 'admin-downloads.html', icon: 'fa-download', text: 'Downloads' },
        { id: 'homepage', href: 'admin-homepage.html', icon: 'fa-pen-to-square', text: 'Landing page' },
        { id: 'documents', href: 'admin-documents.html', icon: 'fa-file-arrow-up', text: 'Documents' },
        { id: 'accounts', href: 'admin-accounts.html', icon: 'fa-users', text: 'Admin accounts' },
        { id: 'profile', href: 'admin-profile.html', icon: 'fa-id-badge', text: 'My profile' }
    ];
    const note = {
        overview: 'Review visitor activity and open the page responsible for each task.',
        downloads: 'Review visitor details and document request status.',
        homepage: 'Landing-page edits are saved on the server and visible to every visitor.',
        documents: 'Published documents are stored privately and require visitor details before viewing or downloading.',
        accounts: 'View administrator accounts and send secure, time-limited password reset links.',
        profile: 'Update your administrator details and profile image shown across the admin workspace.'
    }[active];

    useEffect(() => {
        const handleNotification = (event) => setNotification(event.detail);
        window.addEventListener(ADMIN_NOTIFICATION_EVENT, handleNotification);
        try {
            const notice = window.sessionStorage.getItem('kade-admin-login-notice');
            if (notice) {
                window.sessionStorage.removeItem('kade-admin-login-notice');
                setNotification({ message: notice, tone: 'success' });
            }
        } catch { /* The admin page remains usable when storage is disabled. */ }
        return () => window.removeEventListener(ADMIN_NOTIFICATION_EVENT, handleNotification);
    }, []);

    return (
        <div className="admin-page">
            <TimedNotification message={notification?.message} tone={notification?.tone} onClose={dismissNotification} />
            <header className="admin-topbar">
                <div className="admin-brand-group">
                    <a className="admin-avatar-link" href="admin-profile.html" title={`${session.displayName} · ${session.email}`} aria-label="Administrator profile">
                        {profileImage
                            ? <img className="admin-avatar-img" src={profileImage} alt="" />
                            : <span className="admin-account-avatar admin-avatar-topbar" aria-hidden="true">{initials}</span>}
                    </a>
                    <a className="admin-brand" href="../index.html">
                        <span>{session.displayName}<span className="admin-brand-sub"> </span></span>
                    </a>
                </div>
                <div className="admin-topbar-actions">
                    <span className="prototype-pill"><span /> ADMIN</span>
                    <a className="admin-view-site" href="../index.html"><i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /> {t('View site')}</a>
                </div>
            </header>
            <main className="admin-shell">
                <aside className="admin-sidebar" aria-label="Admin sections">
                    <p className="admin-nav-label">{t('WORKSPACE')}</p>
                    {links.map((link) => (
                        <a key={link.id} className={`admin-nav-link${active === link.id ? ' active' : ''}`} href={link.href}>
                            <i className={`fas ${link.icon}`} aria-hidden="true" /> {t(link.text)}
                            {link.id === 'downloads' && <span className="nav-count">{downloadCount}</span>}
                            {link.id === 'documents' && <span className="nav-count" aria-label={`${publishedDocumentCount} published CVs and certificates`}>{publishedDocumentCount}</span>}
                        </a>
                    ))}
                    <AdminThemeToggle />
                    <LanguageSelector />
                    <div className="admin-sidebar-note">
                        <i className="fas fa-circle-info" aria-hidden="true" />
                        <p>{t(note)}</p>
                    </div>
                    <div className="admin-account" title="Signed-in administrator profile">
                        {profileImage
                            ? <img className="admin-account-img" src={profileImage} alt="" />
                            : <span className="admin-account-avatar" aria-hidden="true">{initials}</span>}
                        <span className="admin-account-details"><strong>{session.displayName}</strong><small>{session.email}</small></span>
                    </div>
                    <a className="admin-sidebar-account-count" href="admin-accounts.html" title="View administrator accounts">
                        <i className="fas fa-users" aria-hidden="true" />
                        <span>{t('Admin accounts')}</span>
                        <strong>{adminAccountCount === null ? '…' : adminAccountCount}</strong>
                    </a>
                    <div className="admin-sidebar-spacer" />
                    {logoutError && <p className="form-feedback error" role="status">{logoutError}</p>}
                    <button className="admin-logout" type="button" onClick={logout} disabled={loggingOut}>
                        <i className="fas fa-right-from-bracket" aria-hidden="true" /> {loggingOut ? t('Logging out…') : t('Log out')}
                    </button>
                </aside>
                <div className="admin-content">
                    {children}
                    <footer className="admin-footer"><span>{session.displayName} · Portfolio</span><span>Protected by administrator</span></footer>
                </div>
            </main>
        </div>
    );
}

function AdminPage({ active, children }) {
    const auth = useAdminSession();
    const downloadData = useAdminDownloads(auth.ready && Boolean(auth.session));
    if (!auth.ready || !auth.session) return null;
    return (
        <AdminFrame
            session={auth.session}
            logout={auth.logout}
            logoutError={auth.logoutError}
            loggingOut={auth.loggingOut}
            active={active}
            downloadCount={downloadData.downloads.length}
        >
            <AdminSessionContext.Provider value={auth.session}>{children}</AdminSessionContext.Provider>
        </AdminFrame>
    );
}

export function AdminLoginPage() {
    const { t } = useLanguage();
    // The name of the admin who signed in last, fetched so the login-page
    // footer can show the same name as the public site footer.
    const [loginAdminName, setLoginAdminName] = useState('David KWIZERA');
    useEffect(() => {
        let active = true;
        apiFetch('/homepage')
            .then(async (response) => {
                const result = await response.json();
                if (active && typeof result.content?.adminName === 'string' && result.content.adminName.trim()) {
                    setLoginAdminName(result.content.adminName.trim());
                }
            })
            .catch(() => { /* Keep the default name when the API is unreachable. */ });
        return () => { active = false; };
    }, []);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [loginNotification, setLoginNotification] = useState(null);
    const dismissLoginNotification = useCallback(() => setLoginNotification(null), []);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('session') === 'unavailable') {
            setFeedback('Could not verify your previous session. Sign in again to continue.');
        }
        // Warm up a sleeping server (e.g. Render free tier) while the page opens.
        apiFetch('/health', { credentials: 'include' }).catch(() => {});
        let active = true;
        apiFetch('/auth/me', {
            credentials: 'include',
            headers: getStoredSessionToken() ? { Authorization: `Bearer ${getStoredSessionToken()}` } : undefined
        })
            .then(async (response) => {
                if (response.ok) {
                    window.location.replace('admin.html');
                    return;
                }
                if (response.status === 401) storeSessionToken('');
                if (response.status !== 401) {
                    const result = await response.json();
                    throw new Error(result.error || 'Could not verify the admin session.');
                }
            })
            .catch((error) => {
                console.error('Could not check the admin session:', error);
                if (active) {
                    setFeedback('Could not verify the sign-in service. Check the connection and try again.');
                    setLoginNotification({ message: 'Could not verify the sign-in service.', tone: 'error' });
                }
            });
        return () => { active = false; };
    }, []);

    async function submitLogin(event) {
        event.preventDefault();
        const checkStartedAt = Date.now();
        const keepCheckVisible = async () => {
            const remaining = 800 - (Date.now() - checkStartedAt);
            if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining));
        };
        setFeedback('');
        setSubmitting(true);
        try {
            const response = await apiFetch('/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            await keepCheckVisible();
            if (!response.ok) {
                setFeedback(result.error || 'Could not sign in. Please try again.');
                setLoginNotification({ message: result.error || 'Could not sign in. Please try again.', tone: 'error' });
                return;
            }

            // Save the fallback session token (used when the browser blocks
            // third-party cookies, e.g. on mobile).
            storeSessionToken(result.sessionToken || '');

            // Confirm the session is usable: either via the HTTP-only cookie
            // or the stored bearer token.
            const sessionToken = getStoredSessionToken();
            const sessionResponse = await apiFetch('/auth/me', {
                credentials: 'include',
                headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined
            });
            const sessionResult = await sessionResponse.json();
            const signedInEmail = result.user?.email?.trim().toLowerCase();
            const verifiedEmail = sessionResult.user?.email?.trim().toLowerCase();
            if (!sessionResponse.ok || !sessionResult.success || !signedInEmail || verifiedEmail !== signedInEmail) {
                storeSessionToken('');
                const message = 'Your credentials were accepted, but this browser could not verify the admin session. Allow cookies for this site and try again.';
                setFeedback(message);
                setLoginNotification({ message, tone: 'error' });
                return;
            }

            try { window.sessionStorage.setItem('kade-admin-login-notice', 'You signed in successfully.'); } catch { /* Continue to the admin workspace if storage is disabled. */ }
            window.location.replace('admin.html');
        } catch (error) {
            await keepCheckVisible();
            console.error('Admin login request failed:', error);
            const message = error instanceof Error && error.message
                ? error.message
                : 'The sign-in server did not respond. It may be waking up — try again in a few seconds.';
            setFeedback(message);
            setLoginNotification({ message, tone: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <TimedNotification message={loginNotification?.message} tone={loginNotification?.tone} onClose={dismissLoginNotification} />
            <div className="auth-layout">
                <LanguageSelector />
                <a className="auth-back-link" href="../index.html"><i className="fas fa-arrow-left" aria-hidden="true" /> {t('Back to portfolio')}</a>
                <section className="auth-card" aria-labelledby="login-title">
                    <div className="auth-heading">
                        <span className="auth-icon"><i className="fas fa-shield-halved" aria-hidden="true" /></span>
                        <p className="auth-eyebrow">{t('PRIVATE WORKSPACE')}</p>
                        <h1 id="login-title">{t('Welcome back')}</h1>
                        <p>{t('Sign in with your administrator credentials to continue.')}</p>
                    </div>
                    <form className="auth-form" onSubmit={submitLogin} autoComplete="off">
                        <label htmlFor="admin-email">{t('Email address')}</label>
                        <div className="auth-input-wrap">
                            <i className="far fa-envelope" aria-hidden="true" />
                            <input id="admin-email" name="email" type="email" autoComplete="off" maxLength={254} placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
                        </div>
                        <label htmlFor="admin-password">{t('Password')}</label>
                        <div className="auth-input-wrap">
                            <i className="fas fa-key" aria-hidden="true" />
                            <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" maxLength={1024} placeholder="Enter your password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                                <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                            </button>
                        </div>
                        <p className="auth-feedback" aria-live="polite">{feedback}</p>
                        <button className="auth-submit" type="submit" disabled={submitting}>
                            <span>{submitting ? 'Checking credentials…' : 'Sign in to admin'}</span><i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`} aria-hidden="true" />
                        </button>
                    </form>
                    <a className="auth-recovery-link" href="admin-reset-password.html">Forgot your password?</a>
                    <p className="auth-footnote"><i className="fas fa-lock" aria-hidden="true" /> Secure sign-in · Administrator access only</p>
                </section>
                <footer className="auth-footer">
                    <p>© {new Date().getFullYear()} {loginAdminName} · All rights reserved.</p>
                    <p>Powered by KadeTech | <a href="tel:+250788950833">Contact</a> | <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kadecomputerscience@gmail.com" target="_blank" rel="noopener noreferrer">Email</a></p>
                </footer>
            </div>
        </main>
    );
}

export function AdminOverviewPage() {
    return <AdminPage active="overview"><OverviewContentPage /></AdminPage>;
}

function OverviewContentPage() {
    const [documents, setDocuments] = useState([]);
    const [documentsError, setDocumentsError] = useState('');
    const now = useAdminClock();
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    }).format(now);

    useEffect(() => {
        let active = true;
        apiRequest('/documents')
            .then((response) => responseJson(response, 'Could not load document details.'))
            .then((result) => { if (active) setDocuments(Array.isArray(result.documents) ? result.documents : []); })
            .catch((error) => { if (active) setDocumentsError(displayError(error, 'Could not load document details.')); });
        return () => { active = false; };
    }, []);

    return <OverviewContent today={today} documents={documents} documentsError={documentsError} />;
}

function OverviewContent({ today, documents = [], documentsError }) {
    const { downloads } = useAdminDownloads(true);
    const session = useContext(AdminSessionContext);
    const publishedCvs = documents.filter((item) => item.type === 'cv').length;
    const publishedCertificates = documents.filter((item) => item.type === 'certificate').length;
    return (
        <>
            <section id="overview" className="admin-heading">
                <div><p className="admin-eyebrow">PORTFOLIO CONTROL CENTER</p>
                <h1>Welcome Back, <span>{session?.displayName}</span><span>!</span></h1>
                <p className="admin-subheading">Review visitor activity and published document counts.</p>
                </div>
                <div className="admin-date"><i className="far fa-calendar" aria-hidden="true" /> <span>{today}</span></div>
            </section>
            <section className="stats-grid" aria-label="Portfolio statistics">
                <article className="stat-card"><div className="stat-icon blue"><i className="fas fa-download" aria-hidden="true" /></div><div><p>Total downloads</p><strong>{downloads.filter((item) => item.downloadedAt).length}</strong></div><span className="stat-caption">database records</span></article>
                <article className="stat-card"><div className="stat-icon violet"><i className="fas fa-user-plus" aria-hidden="true" /></div><div><p>New enquiries</p><strong>{downloads.filter((item) => !item.downloadedAt).length}</strong></div><span className="stat-caption">database requests</span></article>
                <article className="stat-card"><div className="stat-icon green"><i className="fas fa-file-pdf" aria-hidden="true" /></div><div><p>CVs published</p><strong>{documentsError ? '—' : publishedCvs}</strong></div><span className="stat-caption">published CVs</span></article>
                <article className="stat-card"><div className="stat-icon violet"><i className="fas fa-certificate" aria-hidden="true" /></div><div><p>Certificates published</p><strong>{documentsError ? '—' : publishedCertificates}</strong></div><span className="stat-caption">published certificates</span></article>
            </section>
            <section className="admin-panel overview-links" aria-label="Dashboard sections">
                <div className="panel-heading"><div><p className="admin-eyebrow">QUICK ACCESS</p><h2>Manage your portfolio</h2></div></div>
                <div className="overview-link-grid">
                    <a className="overview-link-card" href="admin-downloads.html"><span className="section-icon"><i className="fas fa-download" aria-hidden="true" /></span><span><strong>Downloads</strong><small>Review visitor requests and contacts</small></span><i className="fas fa-arrow-right" aria-hidden="true" /></a>
                    <a className="overview-link-card" href="admin-homepage.html"><span className="section-icon"><i className="fas fa-pen-to-square" aria-hidden="true" /></span><span><strong>Landing page</strong><small>Manage public landing-page content</small></span><i className="fas fa-arrow-right" aria-hidden="true" /></a>
                    <a className="overview-link-card" href="admin-profile.html"><span className="section-icon"><i className="fas fa-id-badge" aria-hidden="true" /></span><span><strong>My profile</strong><small>Manage your admin details and image</small></span><i className="fas fa-arrow-right" aria-hidden="true" /></a>
                </div>
            </section>
            <section className="admin-panel overview-document-cta" aria-label="Document management">
                <div><p className="admin-eyebrow">DOCUMENT MANAGEMENT</p><h2>Manage published documents</h2><p className="panel-description">Add or manage CVs and certificates on the Documents page.</p>{documentsError && <p className="form-feedback error" role="status">{documentsError}</p>}</div>
                <a className="admin-button primary" href="admin-documents.html"><i className="fas fa-file-arrow-up" aria-hidden="true" /> Add document</a>
            </section>
        </>
    );
}
export function AdminDownloadsPage() {
    return <AdminPage active="downloads"><DownloadsContent /></AdminPage>;
}

function DownloadReason({ text }) {
    const [expanded, setExpanded] = useState(false);
    const value = typeof text === 'string' && text.trim() ? text.trim() : 'No purpose provided';
    const needsExpansion = value.length > 150;
    return <div className="download-reason-wrap">
        <small className={`download-reason${expanded ? ' expanded' : ''}`}>{value}</small>
        {needsExpansion && <button className="download-reason-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)}>
            {expanded ? 'Read less' : 'Read more'} <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} aria-hidden="true" />
        </button>}
    </div>;
}

function DownloadsContent() {
    const [search, setSearch] = useState('');
    const [actionError, setActionError] = useState('');
    const [deletingId, setDeletingId] = useState('');
    const [listExpanded, setListExpanded] = useState(false);
    const { downloads, error, setError, lastUpdated, refreshing, refresh } = useAdminDownloads(true);
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return downloads.filter((item) =>
            `${item.name} ${item.email || ''} ${item.phone || ''} ${item.document} ${item.reason || ''}`.toLowerCase().includes(query)
        );
    }, [downloads, search]);
    const now = useAdminClock();
    const today = new Intl.DateTimeFormat(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    }).format(now);

    async function deleteDownload(item) {
        if (!window.confirm('Delete this visitor download request? This cannot be undone.')) return;
        setActionError('');
        setDeletingId(item.id);
        try {
            const response = await apiRequest(`/downloads/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
            await responseJson(response, 'Could not delete this request.');
            await refresh();
        } catch (requestError) {
            console.error('Download request deletion failed:', requestError);
            setActionError(displayError(requestError, 'Could not delete this request.'));
        } finally {
            setDeletingId('');
        }
    }

    return (
            <>
                    <section className="admin-heading">
                        <div><p className="admin-eyebrow">VISITOR ACTIVITY</p><h1>Downloads &amp; enquiries</h1><p className="admin-subheading">Visitor contact information and document request history.</p></div>
                        <div className="admin-date"><i className="far fa-calendar" aria-hidden="true" /> <span>{today}</span></div>
                    </section>
                    <section id="downloads" className="admin-panel">
                        <div className="panel-heading">
                            <div><p className="admin-eyebrow">REQUEST HISTORY</p><h2>Recent downloads</h2></div>
                            <div className="download-tools">
                                <label className="search-box"><i className="fas fa-search" aria-hidden="true" /><span className="sr-only">Search downloads</span><input type="search" placeholder="Search by name, contact or purpose" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                                <button className="admin-button quiet" type="button" aria-expanded={listExpanded} onClick={() => setListExpanded((value) => !value)}><i className={`fas ${listExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true" /> {listExpanded ? 'Collapse list' : 'Expand list'}</button>
                                <button className="admin-button quiet" type="button" disabled={refreshing} onClick={() => refresh()}><i className="fas fa-rotate" aria-hidden="true" /> Refresh</button>
                            </div>
                        </div>
                        <p className="downloads-updated">Live clock <time dateTime={now.toISOString()}>{formatDateTime(now, true)}</time><span>Last refreshed <time>{lastUpdated || 'Not yet'}</time></span></p>
                        {(error || actionError) && <p className="form-feedback error" role="status">{actionError || error}</p>}
                        <div className="table-wrap">
                            <p className="list-collapsed-note" hidden={listExpanded || filtered.length <= 2}>
                                <i className="fas fa-eye-slash" aria-hidden="true" /> {Math.max(0, filtered.length - 2)} more requests are hidden. Expand the list to show all visitor records.
                            </p>
                            <table className="download-table">
                                <thead><tr><th>VISITOR</th><th>CONTACT</th><th>DOCUMENT TYPE</th><th>DOCUMENT &amp; PURPOSE</th><th>DATE</th><th>STATUS</th><th>ACTION</th></tr></thead>
                                <tbody>
                                    {(listExpanded ? filtered : filtered.slice(0, 2)).map((item) => (
                                        <tr key={item.id}>
                                            <td><div className="visitor-cell"><span className="visitor-name">{item.name}</span></div></td>
                                            <td><div className="download-contact-details">{item.email && <span className="contact-cell"><i className="fas fa-envelope" aria-hidden="true" /><span>{item.email}</span></span>}{item.phone && <span className="contact-cell"><i className="fas fa-phone" aria-hidden="true" /><span>{item.phone}</span></span>}</div></td>
                                            <td><div className="download-type-checks"><label><input type="checkbox" checked={Boolean(item.downloadedAt) && item.documentType === 'cv'} disabled readOnly /><span>CV</span></label><label><input type="checkbox" checked={Boolean(item.downloadedAt) && item.documentType === 'certificate'} disabled readOnly /><span>Cert</span></label></div></td>
                                            <td><strong>{item.document}</strong><DownloadReason text={item.reason} /></td>
                                            <td>{formatDateTime(item.downloadedAt || item.requestedAt)}</td>
                                            <td><span className={`status-badge${item.downloadedAt || item.downloadStatus === 'downloaded' ? ' downloaded' : item.downloadStatus === 'failed' ? ' failed' : ' requested'}`} title={item.downloadedAt || item.downloadStatus === 'downloaded' ? 'Download completed' : item.downloadStatus === 'failed' ? 'Download failed' : 'Awaiting download'}>{item.downloadedAt || item.downloadStatus === 'downloaded' ? <><i className="fas fa-arrow-down" aria-hidden="true" /><i className="fas fa-check" aria-hidden="true" /></> : item.downloadStatus === 'failed' ? <i className="fas fa-question" aria-label="Download failed" /> : <i className="fas fa-hourglass-half" aria-label="Requested" />}</span></td>
                                            <td><button className="download-delete-button" type="button" aria-label={`Delete request from ${item.name}`} title="Delete request" disabled={deletingId === item.id} onClick={() => deleteDownload(item)}><i className="fas fa-trash-can" aria-hidden="true" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <div className="empty-state">
                                    <span className="empty-icon"><i className="fas fa-inbox" aria-hidden="true" /></span>
                                    <h3>{downloads.length && search.trim() ? 'No matching enquiries' : 'No download enquiries yet'}</h3>
                                    <p>{downloads.length && search.trim() ? 'Try another name, email address, phone number or document.' : 'Visitor details and document requests are saved here by the backend.'}</p>
                                    <a href="document.html" className="small-action">Open the visitor documents page <i className="fas fa-arrow-right" aria-hidden="true" /></a>
                                </div>
                            )}
                        </div>
                    </section>
            </>
    );
}

export function updateNestedValue(target, path, value) {
    const copy = structuredClone(target);
    let parent = copy;
    for (const key of path.slice(0, -1)) {
        if (parent == null || typeof parent !== 'object' || !(key in parent)) {
            throw new Error(`Cannot set value: path segment "${key}" is missing in the content.`);
        }
        parent = parent[key];
    }
    parent[path[path.length - 1]] = value;
    return copy;
}

function HomepageFields({ content, schema, onChange }) {
    const { t } = useLanguage();
    if (!content) return null;
    return Object.entries(content).map(([section, fields]) => (
        section === 'adminName' ? (
            <fieldset className="homepage-editor-section" key={section}>
                <legend>Footer administrator name</legend>
                <div className="homepage-editor-field">
                    <label htmlFor="homepage-admin-name">Administrator name shown in the footer</label>
                    <input
                        id="homepage-admin-name"
                        type="text"
                        maxLength={120}
                        value={fields ?? ''}
                        onChange={(event) => {
                            onChange(['adminName'], event.target.value);
                            onChange(['adminNameCustom'], Boolean(event.target.value.trim()));
                        }}
                    />
                    <small>Leave this blank to use the name of the most recently signed-in administrator. Enter a name to keep a custom footer name across future sign-ins.</small>
                </div>
            </fieldset>
        ) : section === 'adminNameCustom' ? null : (
        !fields || typeof fields !== 'object' || Array.isArray(fields) ? null :
        <fieldset className="homepage-editor-section" key={section}>
            <legend>{formatFieldLabel(section)}</legend>
            {Object.entries(fields).map(([key, value]) => {
                if (section === 'footer' && key === 'adminName') return null;
                const id = `homepage-field-${section}-${key}`;
                const path = [section, key];
                const fieldType = schema?.[section]?.[key];
                if (typeof fieldType === 'boolean') {
                    return <div className="homepage-editor-field homepage-editor-toggle" key={key}><label htmlFor={id}><input id={id} type="checkbox" checked={value} onChange={(event) => onChange(path, event.target.checked)} /> {key === 'visible' ? 'Display this section on the landing page' : `Enable ${formatFieldLabel(key).toLowerCase()}`}</label></div>;
                }
                if (Array.isArray(fieldType)) {
                    if (section === 'footer' && key === 'socialLinks' && Array.isArray(value)) {
                        return (
                            <div className="homepage-editor-field" key={key}>
                                <label>{formatFieldLabel(key)}</label>
                                <div className="social-links-editor">
                                    {value.map((item, index) => (
                                        <div className="social-link-row" key={index}>
                                            <input type="text" maxLength={60} placeholder="Name (e.g. GitHub)" value={item.label ?? ''} onChange={(event) => onChange([...path, index, 'label'], event.target.value)} aria-label={`Social link ${index + 1} name`} />
                                            <input type="text" maxLength={80} placeholder="Icon (e.g. fab fa-github)" value={item.icon ?? ''} onChange={(event) => onChange([...path, index, 'icon'], event.target.value)} aria-label={`Social link ${index + 1} icon class`} />
                                            <input type="text" maxLength={500} placeholder="URL (https://…)" value={item.href ?? ''} onChange={(event) => onChange([...path, index, 'href'], event.target.value)} aria-label={`Social link ${index + 1} URL`} />
                                            <button className="admin-button quiet" type="button" onClick={() => onChange(path, value.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${item.label || `social link ${index + 1}`}`}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                                <button className="admin-button quiet" type="button" disabled={value.length >= 30} onClick={() => onChange(path, [...value, { label: '', icon: '', href: '' }])}>Add social link</button>
                                <small>Enter a name, a Font Awesome icon class (for example <code>fab fa-github</code>, <code>fab fa-linkedin</code>, or <code>fab fa-whatsapp</code>), and the full profile URL. You can leave a field blank or remove a link.</small>
                            </div>
                        );
                    }
                    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
                    return <div className="homepage-editor-field" key={key}><label htmlFor={id}>{formatFieldLabel(key)}</label><textarea id={id} rows={Math.min(Math.max(fieldType.length * 3, 5), 14)} value={jsonValue} spellCheck={false} onChange={(event) => onChange(path, event.target.value)} /><small>Edit this list as JSON. Keep each item’s fields, such as label and href.</small></div>;
                }
                if (key.toLowerCase() === 'phone' && typeof value === 'string') {
                    return <div className="homepage-editor-field" key={key}><label htmlFor={id}>{t('Phone number')}</label><PhoneNumberField id={id} value={value} onChange={(phone) => onChange(path, phone)} /></div>;
                }
                return <div className="homepage-editor-field" key={key}><label htmlFor={id}>{formatFieldLabel(key)}</label><textarea id={id} rows={typeof value === 'string' && value.length > 120 ? 4 : 2} maxLength={2000} value={value ?? ''} onChange={(event) => onChange(path, event.target.value)} /></div>;
            })}
        </fieldset>
        )
    ));
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(reader.error || new Error('Could not read the selected file.'));
        reader.readAsDataURL(file);
    });
}

async function readPdfAsBase64(file) {
    const dataUrl = await readFileAsDataUrl(file);
    return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

export function AdminHomepagePage() {
    return <AdminPage active="homepage"><HomepageContent /></AdminPage>;
}

function HomepageContent() {
    const [content, setContent] = useState(null);
    const [originalContent, setOriginalContent] = useState(null);
    const [loadingError, setLoadingError] = useState('');
    const [feedback, setFeedback] = useState({ message: '', error: false });
    const [saving, setSaving] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [reviewDraft, setReviewDraft] = useState(null);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        let active = true;
        apiRequest('/homepage')
            .then((response) => responseJson(response, 'Could not load homepage content.'))
            .then((result) => {
                if (active) {
                    setContent(result.content);
                    setOriginalContent(result.content);
                }
            })
            .catch((error) => {
                if (active) {
                    const message = displayError(error, 'Could not load homepage content.');
                    setLoadingError(message);
                    notifyAdmin(message, 'error');
                }
            });
        return () => { active = false; };
    }, []);

    function handleFieldChange(path, value) {
        setContent((current) => updateNestedValue(current, path, value));
        setFeedback({ message: '', error: false });
    }

    function prepareHomepageContent() {
            const contentToSave = structuredClone(content);
            for (const [section, schemaFields] of Object.entries(originalContent)) {
                if (!schemaFields || typeof schemaFields !== 'object' || Array.isArray(schemaFields)) continue;
                for (const [key, schemaValue] of Object.entries(schemaFields)) {
                    const draftValue = contentToSave[section]?.[key];
                    if (Array.isArray(schemaValue) && typeof draftValue === 'string') {
                        contentToSave[section][key] = draftValue.trim() ? JSON.parse(draftValue) : [];
                    }
                }
            }
            contentToSave.adminName = typeof content.adminName === 'string' ? content.adminName.trim() : '';
            contentToSave.adminNameCustom = Boolean(contentToSave.adminName) && content.adminNameCustom === true;
            return contentToSave;
    }

    function saveHomepage(event) {
        event.preventDefault();
        try {
            const draft = prepareHomepageContent();
            if (draft.footer?.phone && !isValidEastAfricanPhone(draft.footer.phone)) {
                throw new Error('Enter a valid East African phone number with its country code before reviewing.');
            }
            localStorage.setItem('kade-homepage-review-draft', JSON.stringify(draft));
            setReviewDraft(draft);
            setReviewing(true);
            setFeedback({ message: '', error: false });
            notifyAdmin('Homepage preview is ready for review.', 'success');
        } catch (error) {
            const message = error instanceof SyntaxError ? 'A list contains invalid JSON. Correct it and try again.' : displayError(error, 'Could not prepare the homepage preview.');
            setFeedback({ message, error: true });
            notifyAdmin(message, 'error');
        }
    }

    async function publishHomepage() {
        setSaving(true);
        setFeedback({ message: '', error: false });
        try {
            const contentToSave = reviewDraft || JSON.parse(localStorage.getItem('kade-homepage-review-draft') || 'null');
            if (!contentToSave) throw new Error('Save and review the homepage before publishing.');
            let response = await apiRequest('/homepage', { method: 'PUT', body: JSON.stringify({ content: contentToSave }), silentNotification: true });
            let legacyApi = false;
            let normalizedSiteSettings = false;
            if (!response.ok) {
                const errorResult = await response.clone().json().catch(() => ({}));
                const schemaMismatch = /missing or unexpected fields/i.test(errorResult.error || '');
                if (schemaMismatch) {
                    const compatibleContent = structuredClone(contentToSave);
                    delete compatibleContent.adminNameCustom;
                    if (/content\.site\b/i.test(errorResult.error || '')) {
                        const site = compatibleContent.site || {};
                        const expectedSite = {
                            title: typeof site.title === 'string' ? site.title : '',
                            description: typeof site.description === 'string' ? site.description : ''
                        };
                        normalizedSiteSettings = JSON.stringify(site) !== JSON.stringify(expectedSite);
                        compatibleContent.site = expectedSite;
                    }
                    response = await apiRequest('/homepage', {
                        method: 'PUT',
                        body: JSON.stringify({ content: compatibleContent }),
                        silentNotification: true
                    });
                    legacyApi = true;
                }
            }
            const result = await responseJson(response, 'Could not save homepage content.');
            setContent(result.content);
            setOriginalContent(result.content);
            localStorage.removeItem('kade-homepage-review-draft');
            setReviewDraft(null);
            setReviewing(false);
            const successMessage = normalizedSiteSettings
                    ? 'Homepage changes were published successfully. The server accepted Site title (content.site.title) and Site description (content.site.description) after removing unsupported fields from content.site.'
                    : legacyApi && contentToSave.adminNameCustom
                        ? 'Homepage changes are live. Update the backend to preserve the custom footer name across sign-ins.'
                        : 'Homepage changes were published successfully and are now visible to visitors.';
            setFeedback({ message: '', error: false });
            notifyAdmin(successMessage, 'success');
        } catch (error) {
            console.error('Homepage content update failed:', error);
            const message = error instanceof SyntaxError ? 'Could not publish. Problem field: a list contains invalid JSON. Correct the list and try again.' : describePublishError(error);
            setFeedback({ message: '', error: false });
            notifyAdmin(message, 'error');
        } finally {
            setSaving(false);
        }
    }

    async function resetHomepage() {
        if (!window.confirm('Restore the default landing-page content for all visitors?')) return;
        setResetting(true);
        setFeedback({ message: '', error: false });
        try {
            const response = await apiRequest('/homepage/reset', { method: 'POST' });
            const result = await responseJson(response, 'Could not restore default homepage content.');
            setContent(result.content);
            setOriginalContent(result.content);
            setFeedback({ message: 'Default landing-page content restored for all visitors.', error: false });
        } catch (error) {
            console.error('Homepage content reset failed:', error);
            setFeedback({ message: displayError(error, 'Could not restore homepage content.'), error: true });
        } finally {
            setResetting(false);
        }
    }

    const now = useAdminClock();
    const today = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(now);
    const publishedProfileImage = typeof content?.brand?.imageUrl === 'string'
        && !content.brand.imageUrl.includes('media/')
        ? resolveApiAssetUrl(content.brand.imageUrl)
        : '';
    return (
            <>
                    <section className="admin-heading"><div><p className="admin-eyebrow">PUBLIC CONTENT</p><h1>Landing page</h1><p className="admin-subheading">Manage the text, links, images, cards, and visibility of every landing-page section.</p></div><div className="admin-date"><i className="far fa-calendar" aria-hidden="true" /> <span>{today}</span></div></section>
                    <section id="homepage" className="admin-panel admin-page-panel">
                        <div className="panel-heading"><div><p className="admin-eyebrow">LANDING PAGE CONTENT</p><h2>Edit published content</h2></div><span className="section-icon"><i className="fas fa-pen" aria-hidden="true" /></span></div>
                        <p className="panel-description">Save your edits to review the complete landing page. Visitors will see the changes after you publish them.</p>
                        <div className="profile-image-upload">
                            <div className="profile-image-preview">{publishedProfileImage && <img src={publishedProfileImage} alt="Current profile image" />}</div>
                            <div><h3>Profile image</h3><p className="panel-description">Change the image and choose who can see it from your profile settings.</p><a className="admin-button quiet" href="admin-profile.html"><i className="fas fa-sliders" aria-hidden="true" /> Manage image visibility</a></div>
                        </div>
                        {loadingError && <p className="form-feedback error" role="status">{loadingError}</p>}
                        {feedback.message && !reviewing && <p className={`homepage-publish-toast${feedback.error ? ' error' : ''}`} role="status" aria-live="polite"><i className={`fas ${feedback.error ? 'fa-circle-exclamation' : 'fa-circle-check'}`} aria-hidden="true" /> {feedback.message}</p>}
                        <form className="admin-form" noValidate onSubmit={saveHomepage}>
                            <div className="homepage-editor-fields"><HomepageFields content={content} schema={originalContent} onChange={handleFieldChange} /></div>
                            <div className="form-actions"><button className="admin-button primary" type="submit" disabled={!content || saving}><i className="fas fa-eye" aria-hidden="true" /> Save &amp; review</button><button className="admin-button quiet" id="reset-homepage" type="button" disabled={resetting} onClick={resetHomepage}>Restore defaults</button></div>
                            <p className={`form-feedback${feedback.error ? ' error' : ''}`} aria-live="polite">{feedback.message}</p>
                        </form>
                    </section>
                    {reviewing && <div className="homepage-review-overlay" role="dialog" aria-modal="true" aria-label="Review landing page">
                        <div className="homepage-review-toolbar"><div><strong>Review the complete landing page</strong><span>Empty fields are allowed. Changes go live only when you publish.</span>{feedback.message && <span className={feedback.error ? 'homepage-review-error' : ''} role="status" aria-live="polite">{feedback.message}</span>}</div><div className="form-actions"><button className="admin-button quiet" type="button" onClick={() => setReviewing(false)}>Back to editing</button><button className="admin-button primary" type="button" disabled={saving} onClick={publishHomepage}><i className="fas fa-check" aria-hidden="true" /> {saving ? 'Publishing…' : 'Publish to homepage'}</button></div></div>
                        <iframe title="Homepage review" src="../index.html?homepagePreview=1" className="homepage-review-frame" />
                    </div>}
            </>
    );
}

export function AdminProfilePage() {
    return <AdminPage active="profile"><ProfileContent /></AdminPage>;
}

export function AdminAccountsPage() {
    return <AdminPage active="accounts"><AdminAccountsContent /></AdminPage>;
}

function AdminAccountsContent() {
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [feedback, setFeedback] = useState({ message: '', error: false });
    const loadAdmins = useCallback(async () => {
        const response = await apiRequest('/auth/admin-users');
        const result = await responseJson(response, 'Could not load administrator accounts.');
        setAdmins(Array.isArray(result.admins) ? result.admins : []);
        setLoadingAdmins(false);
    }, []);
    useEffect(() => {
        loadAdmins().catch((error) => {
            setLoadError(true);
            setFeedback({ message: displayError(error, 'Could not load administrator accounts.'), error: true });
            setLoadingAdmins(false);
        });
    }, [loadAdmins]);

    async function sendResetLink(admin) {
        setBusyId(admin.id);
        setFeedback({ message: '', error: false });
        try {
            const response = await apiRequest(`/auth/admin-users/${admin.id}/password-reset`, { method: 'POST' });
            const result = await responseJson(response, 'Could not send a password reset link.');
            setFeedback({ message: result.message || `Reset link sent to ${admin.email}.`, error: false });
        } catch (error) {
            setFeedback({ message: displayError(error, 'Could not send a password reset link.'), error: true });
        } finally { setBusyId(null); }
    }

    return <>
        <section className="admin-heading"><div><p className="admin-eyebrow">WORKSPACE SECURITY</p><h1>Admin accounts</h1><p className="admin-subheading">{loadingAdmins ? 'Loading accounts from the database…' : loadError ? 'Could not load accounts from the database.' : `${admins.length} administrator account${admins.length === 1 ? '' : 's'} stored in the database.`}</p></div></section>
        <section className="admin-panel">
            <div className="panel-heading"><div><p className="admin-eyebrow">DATABASE ACCOUNTS</p><h2>Administrator directory</h2></div><span className="section-icon"><i className="fas fa-users" aria-hidden="true" /></span></div>
            <p className="panel-description">Password hashes are never shown in the browser. Send a time-limited recovery link to reset an account password.</p>
            {feedback.message && <p className={`form-feedback${feedback.error ? ' error' : ''}`} role="status">{feedback.message}</p>}
            <div className="table-wrap">
                <table className="download-table admin-account-table">
                    <thead><tr><th>NAME</th><th>PHONE</th><th>EMAIL</th><th>PASSWORD</th><th>RESET</th></tr></thead>
                    <tbody>{admins.map((admin) => <tr key={admin.id}>
                        <td><strong>{admin.displayName}</strong></td>
                        <td>{admin.phone || 'Not provided'}</td>
                        <td>{admin.email}</td>
                        <td><span className="password-protected"><i className="fas fa-lock" aria-hidden="true" /> Protected</span></td>
                        <td><button className="admin-button quiet" type="button" disabled={busyId === admin.id} onClick={() => sendResetLink(admin)}><i className={`fas ${busyId === admin.id ? 'fa-spinner fa-spin' : 'fa-envelope'}`} aria-hidden="true" /> {busyId === admin.id ? 'Sending…' : 'Send reset link'}</button></td>
                    </tr>)}</tbody>
                </table>
                {!loadingAdmins && !loadError && !admins.length && <p className="admin-account-empty">No administrator accounts were returned.</p>}
            </div>
        </section>
    </>;
}

export function AdminPasswordResetPage() {
    const { t } = useLanguage();
    const token = new URLSearchParams(window.location.search).get('token') || '';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isError, setIsError] = useState(false);
    const [busy, setBusy] = useState(false);

    async function submit(event) {
        event.preventDefault();
        if (token && password !== confirmation) { setIsError(true); setFeedback('The passwords do not match.'); return; }
        setBusy(true);
        setFeedback('');
        try {
            const response = await apiFetch(token ? '/auth/password-reset/confirm' : '/auth/password-reset/request', {
                method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(token ? { token, password } : { email: email.trim() })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Could not complete the request.');
            setIsError(false);
            setFeedback(result.message || 'Request completed.');
            if (token) { setPassword(''); setConfirmation(''); }
        } catch (error) { setIsError(true); setFeedback(error.message || 'Could not complete the request.'); }
        finally { setBusy(false); }
    }

    return <main className="auth-page"><div className="auth-layout">
        <LanguageSelector />
        <a className="auth-back-link" href="admin-login.html"><i className="fas fa-arrow-left" aria-hidden="true" /> {t('Back to admin sign-in')}</a>
        <section className="auth-card" aria-labelledby="reset-title">
            <div className="auth-heading"><span className="auth-icon"><i className="fas fa-key" aria-hidden="true" /></span><p className="auth-eyebrow">{t('ACCOUNT RECOVERY')}</p><h1 id="reset-title">{t(token ? 'Reset password' : 'Forgot password?')}</h1><p>{t(token ? 'Choose a new password for your admin account.' : 'Enter your admin email and we will send a one-time reset link if the account exists.')}</p></div>
            <form className="auth-form" onSubmit={submit}>
                {!token ? <><label htmlFor="reset-email">{t('Admin email')}</label><div className="auth-input-wrap"><i className="far fa-envelope" aria-hidden="true" /><input id="reset-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} /></div></> : <>
                    <label htmlFor="new-admin-password">{t('New password')}</label><div className="auth-input-wrap"><i className="fas fa-key" aria-hidden="true" /><input id="new-admin-password" type="password" autoComplete="new-password" minLength={8} maxLength={1024} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
                    <label htmlFor="confirm-admin-password">{t('Confirm new password')}</label><div className="auth-input-wrap"><i className="fas fa-key" aria-hidden="true" /><input id="confirm-admin-password" type="password" autoComplete="new-password" minLength={8} maxLength={1024} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
                </>}
                <p className={`auth-feedback${isError ? ' error' : ''}`} role="status" aria-live="polite">{feedback}</p>
                <button className="auth-submit" type="submit" disabled={busy}><span>{t(busy ? 'Please wait…' : token ? 'Save new password' : 'Send reset link')}</span><i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`} aria-hidden="true" /></button>
                {token && !isError && feedback && <a className="auth-recovery-link" href="admin-login.html">Return to sign in</a>}
            </form>
        </section>
    </div></main>;
}

function ProfileContent() {
    const { t } = useLanguage();
    const session = useContext(AdminSessionContext);
    const [content, setContent] = useState(null);
    const [originalContent, setOriginalContent] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [profileInputVersion, setProfileInputVersion] = useState(0);
    const [profilePreview, setProfilePreview] = useState('');
    const [profileFeedback, setProfileFeedback] = useState({ message: '', error: false });
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [imageVisibility, setImageVisibility] = useState('both');
    const adminProfileImage = useAdminProfileImage();
    const now = useAdminClock();
    const today = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(now);

    useEffect(() => {
        let active = true;
        apiRequest('/homepage')
            .then((response) => responseJson(response, 'Could not load profile details.'))
            .then((result) => {
                if (active) {
                    setContent(result.content);
                    setOriginalContent(result.content);
                }
            })
            .catch((error) => console.error('Could not load profile details:', error));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!profileFile) {
            setProfilePreview('');
            return undefined;
        }
        const url = URL.createObjectURL(profileFile);
        setProfilePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [profileFile]);

    const publishedProfileImage = typeof content?.brand?.imageUrl === 'string'
        && !content.brand.imageUrl.includes('media/')
        ? resolveApiAssetUrl(content.brand.imageUrl)
        : '';

    async function publishProfileImage(visibility) {
        if (!profileFile) {
            setProfileFeedback({ message: 'Choose a profile image first.', error: true });
            notifyAdmin('Choose a profile image first.', 'error');
            return;
        }
        setUploadingProfile(true);
        try {
            const response = await apiRequest('/homepage/profile-image', {
                method: 'POST',
                body: JSON.stringify({ image: await readFileAsDataUrl(profileFile), visibility })
            });
            const result = await responseJson(response, 'Could not save the profile image.');
            if (visibility !== 'admin') {
                setContent((current) => updateNestedValue(current, ['brand', 'imageUrl'], result.imageUrl));
                setOriginalContent((current) => updateNestedValue(current, ['brand', 'imageUrl'], result.imageUrl));
            }
            window.dispatchEvent(new Event(ADMIN_PROFILE_IMAGE_UPDATED));
            setProfileFile(null);
            setProfileInputVersion((version) => version + 1);
            setProfileFeedback({ message: t(visibility === 'admin' ? 'Image set for your admin account only.' : visibility === 'both' ? 'Image published to the public site and admin account.' : 'Image published to the public site only.'), error: false });
        } catch (error) {
            console.error('Profile image upload failed:', error);
            setProfileFeedback({ message: displayError(error, 'Could not save the profile image.'), error: true });
        } finally {
            setUploadingProfile(false);
        }
    }

    return (
        <>
            <section className="admin-heading"><div><p className="admin-eyebrow">{t('ADMINISTRATOR')}</p><h1>{t('My profile')}</h1><p className="admin-subheading">{t('Your signed-in admin details and the profile image shown across the portfolio.')}</p></div><div className="admin-date"><i className="far fa-calendar" aria-hidden="true" /> <span>{today}</span></div></section>
            <section id="profile" className="admin-panel admin-page-panel">
                <div className="panel-heading"><div><p className="admin-eyebrow">ACCOUNT DETAILS</p><h2>Signed-in administrator</h2></div><span className="section-icon"><i className="fas fa-id-badge" aria-hidden="true" /></span></div>
                <p className="panel-description">These details come from your secure admin session. Sign-in credentials are managed on the server and are never displayed here.</p>
                <dl className="admin-profile-list profile-page-list">
                    <div><dt>Name</dt><dd>{session?.displayName}</dd></div>
                    <div><dt>Email</dt><dd>{session?.email}</dd></div>
                    <div><dt>Role</dt><dd>Administrator</dd></div>
                    <div><dt>Session</dt><dd><span className="admin-profile-session-ok"><i className="fas fa-shield-halved" aria-hidden="true" /> Active · secure</span></dd></div>
                </dl>
            </section>
            <section className="admin-panel admin-page-panel">
                <div className="panel-heading"><div><p className="admin-eyebrow">{t('PROFILE IMAGE')}</p><h2>{t('Choose where your image appears')}</h2></div><span className="section-icon"><i className="fas fa-image" aria-hidden="true" /></span></div>
                <p className="panel-description">{t('Choose a JPG, PNG, or WebP image up to 5 MB. Publish it to the public site and your admin account, or set it for the admin account only.')}</p>
                <div className="profile-image-upload">
                    <div className="profile-image-previews">
                        <div><div className="profile-image-preview">{((profilePreview && ['admin', 'both'].includes(imageVisibility)) || (!profilePreview && adminProfileImage)) && <img src={profilePreview && ['admin', 'both'].includes(imageVisibility) ? profilePreview : adminProfileImage} alt="Admin account image" />}</div><p className="profile-image-caption">{t('Admin account')}</p></div>
                        <div><div className="profile-image-preview">{((profilePreview && ['public', 'both'].includes(imageVisibility)) || (!profilePreview && publishedProfileImage)) && <img src={profilePreview && ['public', 'both'].includes(imageVisibility) ? profilePreview : publishedProfileImage} alt="Public profile image" />}</div><p className="profile-image-caption">{t('Public site')}</p></div>
                    </div>
                    <div>
                        <div className="profile-image-form">
                            <label className="admin-button quiet" htmlFor="profile-image-input"><i className="fas fa-image" aria-hidden="true" /> {t('Browse image')}</label>
                            <input key={profileInputVersion} id="profile-image-input" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                                    setProfileFile(null);
                                    setProfileInputVersion((version) => version + 1);
                                    setProfileFeedback({ message: 'Choose a JPG, PNG, or WebP image no larger than 5 MB.', error: true });
                                    notifyAdmin('Choose a JPG, PNG, or WebP image no larger than 5 MB.', 'error');
                                    return;
                                }
                                setProfileFile(file);
                                setProfileFeedback({ message: `${file.name} is ready to publish.`, error: false });
                            }} />
                            <fieldset className="profile-image-visibility-actions"><legend>{t('Show this image to')}</legend>
                                {[['admin', 'Admin only'], ['both', 'Both'], ['public', 'Public only']].map(([value, label]) => <label className="profile-image-visibility-option" key={value}><input type="checkbox" checked={imageVisibility === value} onChange={(event) => setImageVisibility(event.target.checked ? value : '')} /> {t(label)}</label>)}
                            </fieldset>
                            <button className="admin-button primary" type="button" disabled={!profileFile || !imageVisibility || uploadingProfile} onClick={() => publishProfileImage(imageVisibility)}><i className={`fas ${uploadingProfile ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`} aria-hidden="true" /> {t('Publish image')}</button>
                        </div>
                        <p className={`form-feedback${profileFeedback.error ? ' error' : ''}`} aria-live="polite">{profileFeedback.message}</p>
                    </div>
                </div>
            </section>
        </>
    );
}

function OtherDocumentList({ documents, onEdit, onDelete, busyId }) {
    if (!documents.length) return null;
    return <div className="certificate-admin-list" aria-live="polite">{documents.map((doc) => (
        <article className="certificate-admin-item" key={doc.documentId}>
            <div className="certificate-admin-copy"><span className="document-kind-tag">Other document</span><strong>{doc.title}</strong><span>{doc.institution} · {doc.issuedAt}</span>{doc.createdAt && <small>Uploaded {formatDateTime(doc.createdAt)}</small>}</div>
            <div className="certificate-admin-actions">
                <button className="admin-button quiet" type="button" disabled={busyId === doc.documentId} onClick={() => onEdit(doc)}>Edit</button>
                <button className="admin-button danger" type="button" disabled={busyId === doc.documentId} onClick={() => onDelete(doc)}>Delete</button>
            </div>
        </article>
    ))}</div>;
}

function CertificateList({ certificates, onEdit, onDelete, busyId }) {
    if (!certificates.length) return <div className="certificate-admin-list" aria-live="polite"><p className="certificate-admin-empty">No certificates have been added yet.</p></div>;
    return <div className="certificate-admin-list" aria-live="polite">{certificates.map((certificate) => (
        <article className="certificate-admin-item" key={certificate.documentId}>
            <div className="certificate-admin-copy"><span className="document-kind-tag">Certificate</span><strong>{certificate.title}</strong><span>{certificate.institution} · {certificate.issuedAt}</span>{certificate.createdAt && <small>Uploaded {formatDateTime(certificate.createdAt)}</small>}</div>
            <div className="certificate-admin-actions">
                <button className="admin-button quiet" type="button" disabled={busyId === certificate.documentId} onClick={() => onEdit(certificate)}>Edit</button>
                <button className="admin-button danger" type="button" disabled={busyId === certificate.documentId} onClick={() => onDelete(certificate)}>Delete</button>
            </div>
        </article>
    ))}</div>;
}

function CvList({ cvs, onEdit, onDelete, busyId }) {
    if (!cvs.length) return <div className="certificate-admin-list" aria-live="polite"><p className="certificate-admin-empty">No CV has been added yet.</p></div>;
    return <div className="certificate-admin-list" aria-live="polite">{cvs.map((cv) => (
        <article className="certificate-admin-item" key={cv.documentId}>
            <div className="certificate-admin-copy"><span className="document-kind-tag">CV</span><strong>{cv.title}</strong><span>{cv.filename}</span>{cv.createdAt && <small>Uploaded {formatDateTime(cv.createdAt)}</small>}</div>
            <div className="certificate-admin-actions">
                <button className="admin-button quiet" type="button" disabled={busyId === cv.documentId} onClick={() => onEdit(cv)}>Edit</button>
                <button className="admin-button danger" type="button" disabled={busyId === cv.documentId} onClick={() => onDelete(cv)}>Delete</button>
            </div>
        </article>
    ))}</div>;
}

const EMPTY_CERTIFICATE = { id: '', type: '', title: '', description: '', issuedAt: '', institution: '' };

export function AdminDocumentsPage() {
    return <AdminPage active="documents"><DocumentsContent /></AdminPage>;
}

function DocumentsContent() {
    const [documents, setDocuments] = useState([]);
    const [loadingError, setLoadingError] = useState('');
    const [cvForm, setCvForm] = useState({ title: '', description: '', issuedAt: '', institution: '' });
    const [cvFile, setCvFile] = useState(null);
    const [cvInputVersion, setCvInputVersion] = useState(0);
    const [cvFeedback, setCvFeedback] = useState({ message: '', error: false });
    const [savingCv, setSavingCv] = useState(false);
    const [certificate, setCertificate] = useState(EMPTY_CERTIFICATE);
    const [certificateFile, setCertificateFile] = useState(null);
    const [certificateInputVersion, setCertificateInputVersion] = useState(0);
    const [certificateFeedback, setCertificateFeedback] = useState({ message: '', error: false });
    const [savingCertificate, setSavingCertificate] = useState(false);
    const [busyId, setBusyId] = useState('');
    const editing = Boolean(certificate.id);

    const loadDocuments = useCallback(async () => {
        const response = await apiRequest('/documents');
        const result = await responseJson(response, 'Could not load document details.');
        const docs = Array.isArray(result.documents) ? result.documents : [];
        setDocuments(docs);
    }, []);

    useEffect(() => {
        let active = true;
        loadDocuments().then(() => {
            // Support deep links like admin-documents.html#edit-<documentId> from the Overview page:
            // once the documents are loaded, start editing the requested document automatically.
            const editTarget = window.location.hash.match(/^#edit-(.+)$/)?.[1];
            if (editTarget) {
                setDocuments((current) => {
                    const item = current.find((doc) => doc.documentId === editTarget);
                    if (item) {
                        window.history.replaceState(null, '', window.location.pathname);
                        editDocument(item);
                    }
                    return current;
                });
            }
        }).catch((error) => {
            console.error('Could not load document details:', error);
            if (active) setLoadingError(displayError(error, 'Could not load document details.'));
        });
        return () => { active = false; };
    }, [loadDocuments]);

    const cvs = documents.filter((item) => item.type === 'cv');
    const certificates = documents.filter((item) => item.type === 'certificate');
    const otherDocuments = documents.filter((item) => item.type === 'document');
    const now = useAdminClock();
    const today = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(now);

    async function submitCv(event) {
        event.preventDefault();
        const editingCv = certificate.type === 'cv' && Boolean(certificate.id);
        const selectedFile = editingCv ? certificateFile : cvFile;
        if (!editingCv && !selectedFile) {
            setCvFeedback({ message: 'Choose a PDF file to publish the CV.', error: true });
            notifyAdmin('Choose a PDF file to publish the CV.', 'error');
            return;
        }
        if (selectedFile && ((selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) || selectedFile.size > 10 * 1024 * 1024)) {
            if (editingCv) {
                setCertificateFile(null);
                setCertificateInputVersion((version) => version + 1);
                setCertificateFeedback({ message: 'Choose a PDF file no larger than 10 MB to update the CV.', error: true });
            } else {
                setCvFile(null);
                setCvInputVersion((version) => version + 1);
                setCvFeedback({ message: 'Choose a PDF file no larger than 10 MB to publish the CV.', error: true });
            }
            notifyAdmin('Choose a PDF file no larger than 10 MB.', 'error');
            return;
        }
        setSavingCv(true);
        try {
            const payload = editingCv
                ? { title: certificate.title, description: certificate.description, issuedAt: certificate.issuedAt, institution: certificate.institution }
                : { ...cvForm };
            if (selectedFile) {
                payload.filename = selectedFile.name;
                payload.file = await readPdfAsBase64(selectedFile);
            }
            const response = editingCv
                ? await apiRequest(`/documents/certificates/${encodeURIComponent(certificate.id)}`, { method: 'PUT', body: JSON.stringify(payload) })
                : await apiRequest('/documents/cv', { method: 'POST', body: JSON.stringify(payload) });
            const result = await responseJson(response, editingCv ? 'Could not save the CV.' : 'Could not publish the new CV.');
            if (editingCv) {
                setDocuments((current) => current.map((item) => item.documentId === certificate.id ? result.document : item));
                resetCertificate();
                setCertificateFeedback({ message: 'CV updated for all visitors.', error: false });
            } else {
                setDocuments((current) => [...current, result.document]);
                setCvForm({ title: '', description: '', issuedAt: '', institution: '' });
                setCvFile(null);
                setCvInputVersion((version) => version + 1);
                setCvFeedback({ message: 'CV added to the document library.', error: false });
            }
        } catch (error) {
            console.error(editingCv ? 'CV update failed:' : 'CV upload failed:', error);
            if (editingCv) setCertificateFeedback({ message: displayError(error, 'Could not save the CV.'), error: true });
            else setCvFeedback({ message: displayError(error, 'Could not publish the new CV.'), error: true });
        } finally {
            setSavingCv(false);
        }
    }

    function editDocument(item) {
        const isCv = item.type === 'cv';
        setCertificate({
            id: item.documentId,
            type: item.type,
            title: item.title,
            description: item.description,
            issuedAt: item.issuedAt || '',
            institution: item.institution || ''
        });
        setCertificateFile(null);
        setCertificateInputVersion((version) => version + 1);
        setCertificateFeedback({ message: '', error: false });
        window.requestAnimationFrame(() => {
            document.getElementById(isCv ? 'cv-edit-form' : 'certificate-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.getElementById(isCv ? 'edit-title' : 'certificate-title')?.focus();
        });
    }

    function resetCertificate() {
        setCertificate(EMPTY_CERTIFICATE);
        setCertificateFile(null);
        setCertificateInputVersion((version) => version + 1);
        setCertificateFeedback({ message: '', error: false });
    }

    async function deleteDocument(item) {
        if (!window.confirm(`Delete "${item.title}" permanently? Visitors will no longer see this document. This cannot be undone.`)) return;
        setBusyId(item.documentId);
        try {
            const response = await apiRequest(`/documents/${encodeURIComponent(item.documentId)}`, { method: 'DELETE' });
            await responseJson(response, 'Could not delete the document.');
            setDocuments((current) => current.filter((doc) => doc.documentId !== item.documentId));
            if (certificate.id === item.documentId) resetCertificate();
            setCertificateFeedback({ message: `"${item.title}" deleted.`, error: false });
        } catch (error) {
            console.error('Document delete failed:', error);
            setCertificateFeedback({ message: displayError(error, 'Could not delete the document.'), error: true });
        } finally {
            setBusyId('');
        }
    }

    async function submitCertificate(event) {
        event.preventDefault();
        if (!editing && !certificateFile) {
            setCertificateFeedback({ message: 'Choose a PDF file for this certificate.', error: true });
            notifyAdmin('Choose a PDF file for this certificate.', 'error');
            return;
        }
        if (certificateFile && ((certificateFile.type !== 'application/pdf' && !certificateFile.name.toLowerCase().endsWith('.pdf')) || certificateFile.size > 10 * 1024 * 1024)) {
            setCertificateFile(null);
            setCertificateInputVersion((version) => version + 1);
            setCertificateFeedback({ message: 'Choose a PDF file no larger than 10 MB for this certificate.', error: true });
            notifyAdmin('Choose a PDF file no larger than 10 MB for this certificate.', 'error');
            return;
        }
        setSavingCertificate(true);
        try {
            const payload = {
                title: certificate.title,
                description: certificate.description,
                issuedAt: certificate.issuedAt,
                institution: certificate.institution
            };
            if (certificateFile) {
                payload.filename = certificateFile.name;
                payload.file = await readPdfAsBase64(certificateFile);
            }
            if (editing) {
                const response = await apiRequest(`/documents/certificates/${encodeURIComponent(certificate.id)}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                const result = await responseJson(response, 'Could not save the document.');
                const saved = result.document;
                setDocuments((current) => current.map((item) => item.documentId === certificate.id ? saved : item));
                resetCertificate();
                setCertificateFeedback({ message: 'Document updated for all visitors.', error: false });
            } else {
                const response = await apiRequest('/documents/certificates', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                const result = await responseJson(response, 'Could not add the certificate.');
                setDocuments((current) => [...current, result.document]);
                resetCertificate();
                setCertificateFeedback({ message: 'Certificate added to the library. Visitors can see it now.', error: false });
            }
        } catch (error) {
            console.error('Certificate save failed:', error);
            setCertificateFeedback({ message: displayError(error, 'Could not save the certificate.'), error: true });
        } finally {
            setSavingCertificate(false);
        }
    }

    return (
            <>
                    <section className="admin-heading"><div><p className="admin-eyebrow">DOCUMENT LIBRARY</p><h1>CV &amp; certificates</h1><p className="admin-subheading">Publish a CV and manage certificate details shown to visitors.</p></div><div className="admin-date"><i className="far fa-calendar" aria-hidden="true" /> <span>{today}</span></div></section>
                    <section id="documents" className="admin-panel admin-page-panel">
                        <div className="panel-heading"><div><p className="admin-eyebrow">DOCUMENT LIBRARY</p><h2>Curriculum vitae</h2></div><span className="section-icon"><i className="fas fa-file-arrow-up" aria-hidden="true" /></span></div>
                        <p className="panel-description">Add a CV with its title, summary, date, and institution. Edit or delete any CV at any time — adding keeps the existing ones.</p>
                        <CvList cvs={cvs} onEdit={editDocument} onDelete={deleteDocument} busyId={busyId} />
                        {loadingError && <p className="form-feedback error" role="status">{loadingError}</p>}
                        <form className="admin-form upload-form" onSubmit={submitCv} id={certificate.type === 'cv' ? 'cv-edit-form' : 'cv-add-form'}>
                            <div className="document-upload-heading"><p className="admin-eyebrow">CV</p><h3>{certificate.type === 'cv' && editing ? 'Edit this CV' : 'Upload a CV'}</h3><span>{certificate.type === 'cv' && editing ? 'Update this CV’s details or replace its PDF.' : 'Add a new CV with its details and PDF file.'}</span></div>
                            {certificate.type === 'cv' && editing ? (
                                <>
                                    <label htmlFor="edit-title">CV title</label><input id="edit-title" name="title" maxLength={120} required value={certificate.title} onChange={(event) => setCertificate({ ...certificate, title: event.target.value })} />
                                    <label htmlFor="edit-description">Description</label><textarea id="edit-description" name="description" rows={3} maxLength={2000} required value={certificate.description} onChange={(event) => setCertificate({ ...certificate, description: event.target.value })} />
                                    <label htmlFor="edit-issued-at">Date issued <span>(optional)</span></label><input id="edit-issued-at" name="issuedAt" type="date" value={certificate.issuedAt} onChange={(event) => setCertificate({ ...certificate, issuedAt: event.target.value })} />
                                    <label htmlFor="edit-institution">Institution <span>(optional)</span></label><input id="edit-institution" name="institution" maxLength={160} value={certificate.institution} onChange={(event) => setCertificate({ ...certificate, institution: event.target.value })} />
                                    <label className="admin-button quiet browse-button" htmlFor="certificate-file-input"><i className="fas fa-folder-open" aria-hidden="true" /> {certificateFile ? certificateFile.name : 'Browse PDF (optional - keeps current)'}</label>
                                    <input key={`cert-file-${certificateInputVersion}`} id="certificate-file-input" type="file" accept="application/pdf,.pdf" hidden onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        setCertificateFile(file);
                                        setCertificateFeedback({ message: `${file.name} is ready to save.`, error: false });
                                    }} />
                                    <div className="form-actions"><button className="admin-button primary" type="submit" disabled={savingCv}><i className="fas fa-check" aria-hidden="true" /> Save changes</button><button className="admin-button quiet" type="button" onClick={resetCertificate}>Cancel edit</button></div>
                                    <p className={`form-feedback${certificateFeedback.error ? ' error' : ''}`} aria-live="polite">{certificateFeedback.message}</p>
                                </>
                            ) : (
                                <>
                                    <label htmlFor="cv-title">CV title</label><input id="cv-title" name="title" maxLength={120} required value={cvForm.title} onChange={(event) => setCvForm({ ...cvForm, title: event.target.value })} />
                                    <label htmlFor="cv-description">Description</label><textarea id="cv-description" name="description" rows={3} maxLength={2000} required value={cvForm.description} onChange={(event) => setCvForm({ ...cvForm, description: event.target.value })} />
                                    <label htmlFor="cv-issued-at">Date issued <span>(optional)</span></label><input id="cv-issued-at" name="issuedAt" type="date" value={cvForm.issuedAt} onChange={(event) => setCvForm({ ...cvForm, issuedAt: event.target.value })} />
                                    <label htmlFor="cv-institution">Institution <span>(optional)</span></label><input id="cv-institution" name="institution" maxLength={160} value={cvForm.institution} onChange={(event) => setCvForm({ ...cvForm, institution: event.target.value })} />
                                    <label className="admin-button quiet browse-button" htmlFor="cv-file-input"><i className="fas fa-folder-open" aria-hidden="true" /> {cvFile ? cvFile.name : 'Browse CV PDF (required)'}</label>
                                    <input key={`cv-file-${cvInputVersion}`} id="cv-file-input" type="file" accept="application/pdf,.pdf" hidden onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        setCvFile(file);
                                        setCvFeedback({ message: `${file.name} is ready to publish.`, error: false });
                                    }} />
                                    <button className="admin-button primary" type="submit" disabled={savingCv}><i className="fas fa-plus" aria-hidden="true" /> Add CV</button>
                                    <p className={`form-feedback${cvFeedback.error ? ' error' : ''}`} aria-live="polite">{cvFeedback.message}</p>
                                </>
                            )}
                        </form>
                        {otherDocuments.length > 0 && (
                        <div className="certificate-admin-section">
                            <div className="panel-heading"><div><p className="admin-eyebrow">OTHER DOCUMENTS</p><h2>Documents</h2></div><span className="section-icon"><i className="fas fa-file-alt" aria-hidden="true" /></span></div>
                        <p className="panel-description">Standalone documents shown in the visitor document center. Edit the details, replace the PDF, or delete any entry you no longer want visitors to see.</p>
                            <OtherDocumentList documents={otherDocuments} onEdit={editDocument} onDelete={deleteDocument} busyId={busyId} />
                        </div>
                        )}
                        <div className="certificate-admin-section">
                            <div className="panel-heading"><div><p className="admin-eyebrow">CERTIFICATE LIBRARY</p><h2>Certificates</h2></div><span className="section-icon"><i className="fas fa-certificate" aria-hidden="true" /></span></div>
                            <p className="panel-description">Add certificates with their title, description, issue date, institution, and PDF. Edit the details, replace the PDF, or delete any entry.</p>
                            <CertificateList certificates={certificates} onEdit={editDocument} onDelete={deleteDocument} busyId={busyId} />
                            <form id="certificate-form" className="admin-form upload-form" onSubmit={submitCertificate}>
                                <div className="document-upload-heading"><p className="admin-eyebrow">{certificate.type === 'document' ? 'OTHER DOCUMENT' : 'CERTIFICATE'}</p><h3>{editing ? `Edit this ${certificate.type === 'document' ? 'document' : 'certificate'}` : 'Upload a certificate'}</h3><span>{editing ? 'Update the document details or replace its PDF file.' : 'Add a certificate with its title, institution, issue date, and PDF file.'}</span></div>
                                <label htmlFor="certificate-title">Certificate title</label><input id="certificate-title" name="title" maxLength={120} required value={certificate.title} onChange={(event) => setCertificate({ ...certificate, title: event.target.value })} />
                                <label htmlFor="certificate-description">Description</label><textarea id="certificate-description" name="description" rows={3} maxLength={2000} required value={certificate.description} onChange={(event) => setCertificate({ ...certificate, description: event.target.value })} />
                                <label htmlFor="certificate-issued-at">Date issued</label><input id="certificate-issued-at" name="issuedAt" type="date" required value={certificate.issuedAt} onChange={(event) => setCertificate({ ...certificate, issuedAt: event.target.value })} />
                                <label htmlFor="certificate-institution">Institution</label><input id="certificate-institution" name="institution" maxLength={160} required value={certificate.institution} onChange={(event) => setCertificate({ ...certificate, institution: event.target.value })} />
                                <label className="admin-button quiet browse-button" htmlFor="certificate-file-input"><i className="fas fa-folder-open" aria-hidden="true" /> {certificateFile ? certificateFile.name : `Browse certificate PDF (${editing ? 'optional - keeps current' : 'required'})`}</label>
                                <input key={`cert-file-${certificateInputVersion}`} id="certificate-file-input" type="file" accept="application/pdf,.pdf" hidden onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    setCertificateFile(file);
                                    setCertificateFeedback({ message: `${file.name} is ready to ${editing ? 'save' : 'add'}.`, error: false });
                                }} />
                                <div className="form-actions">
                                    <button className="admin-button primary" type="submit" disabled={savingCertificate}><i className={`fas ${editing ? 'fa-check' : 'fa-plus'}`} aria-hidden="true" /> {editing ? 'Save changes' : 'Add certificate'}</button>
                                    {editing && <button className="admin-button quiet" type="button" onClick={resetCertificate}>Cancel edit</button>}
                                </div>
                                <p className={`form-feedback${certificateFeedback.error ? ' error' : ''}`} aria-live="polite">{certificateFeedback.message}</p>
                            </form>
                        </div>
                    </section>
            </>
    );
}
