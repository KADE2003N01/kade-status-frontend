import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../services/api.js';
import { getStoredSessionToken, storeSessionToken } from '../../../services/adminSession.js';
import LanguageSelector from '../../../components/LanguageSelector.jsx';
import LogoutIcon from '../../../components/LogoutIcon.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';
import './AdminAuthPages.css';

const allowedDestinations = new Set([
  'admin.html', 'admin-downloads.html', 'admin-homepage.html', 'admin-documents.html',
  'admin-profile.html', 'admin-accounts.html', 'platform-owner.html'
]);

function loginDestination() {
  const requested = new URLSearchParams(window.location.search).get('next');
  return allowedDestinations.has(requested) ? requested : 'admin.html';
}

function AuthFeedback({ children, error = false }) {
  return <p className={`auth-feedback${error ? ' error' : ''}`} role="status" aria-live="polite">{children}</p>;
}

export function AdminLoginPage() {
  const { t } = useLanguage();
  const forceSignIn = new URLSearchParams(window.location.search).get('force') === '1';
  const destination = loginDestination();
  const [clearingSession, setClearingSession] = useState(forceSignIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let current = true;
    if (forceSignIn) {
      storeSessionToken('');
      setFeedback('Your previous session was cleared. Sign in again to continue.');
      setIsError(true);
      apiFetch('/auth/logout', { method: 'POST', credentials: 'include' })
        .catch(() => {})
        .finally(() => { if (current) setClearingSession(false); });
      return () => { current = false; };
    }
    if (new URLSearchParams(window.location.search).get('session') === 'unavailable') {
      setFeedback('Your previous session could not be verified. Sign in again.');
      setIsError(true);
    }
    apiFetch('/health', { credentials: 'include' }).catch(() => {});
    apiFetch('/auth/me', {
      credentials: 'include',
      headers: getStoredSessionToken() ? { Authorization: `Bearer ${getStoredSessionToken()}` } : undefined
    }).then(async response => {
      if (response.ok && current) { window.location.replace(destination); return; }
      if (response.status === 401) storeSessionToken('');
      else if (current) {
        const result = await response.json().catch(() => ({}));
        setFeedback(result.error || 'Could not check your sign-in session.'); setIsError(true);
      }
    }).catch(() => {
      if (current) { setFeedback('The sign-in service could not be reached. Check your connection and try again.'); setIsError(true); }
    });
    return () => { current = false; };
  }, [destination, forceSignIn]);

  async function submit(event) {
    event.preventDefault(); setSubmitting(true); setFeedback(''); setIsError(false);
    if (clearingSession) { setSubmitting(false); return; }
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not sign in. Check your details and try again.');
      storeSessionToken(result.sessionToken || '');
      const token = getStoredSessionToken();
      const check = await apiFetch('/auth/me', { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      const verified = await check.json().catch(() => ({}));
      if (!check.ok || !verified.success || verified.user?.email?.toLowerCase() !== result.user?.email?.toLowerCase()) {
        storeSessionToken('');
        throw new Error('Your browser could not verify the new session. Allow cookies for this site and try again.');
      }
      window.location.replace(destination);
    } catch (error) { setFeedback(t(error.message || 'Could not sign in. Please try again.')); setIsError(true); }
    finally { setSubmitting(false); }
  }

  return <main className="auth-page"><div className="auth-layout">
    <LanguageSelector />
    <a className="auth-back-link" href="../index.html"><i className="fas fa-arrow-left" aria-hidden="true" /> {t('Back to portfolio')}</a>
    <section className="auth-card" aria-labelledby="login-title">
      <div className="auth-heading"><span className="auth-icon"><i className="fas fa-shield-halved" aria-hidden="true" /></span><p className="auth-eyebrow">{t('PRIVATE WORKSPACE')}</p><h1 id="login-title">{t('Welcome back')}</h1><p>{t('Sign in with your administrator credentials to continue.')}</p></div>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="admin-email">{t('Email address')}</label><div className="auth-input-wrap"><i className="far fa-envelope" aria-hidden="true" /><input id="admin-email" name="username" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required value={email} onChange={event => setEmail(event.target.value)} /></div>
        <label htmlFor="admin-password">{t('Password')}</label><div className="auth-input-wrap"><i className="fas fa-key" aria-hidden="true" /><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={1024} placeholder={t('Enter your password')} required value={password} onChange={event => setPassword(event.target.value)} /><button type="button" className="auth-password-visibility" aria-label={showPassword ? t('Hide password') : t('Show password')} onClick={() => setShowPassword(value => !value)}><i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" /></button></div>
        <AuthFeedback error={isError}>{feedback}</AuthFeedback>
        <button className="auth-submit" type="submit" disabled={submitting || clearingSession}><span>{clearingSession ? t('Checking credentials…') : submitting ? t('Checking credentials…') : t('Sign in to admin')}</span><i className={`fas ${submitting || clearingSession ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`} aria-hidden="true" /></button>
      </form>
      <a className="auth-recovery-link" href="admin-reset-password.html">{t('Forgot your password?')}</a>
      <p className="auth-onboarding-note">{t('New administrators join by invitation. If you have already been invited but cannot find your setup email, request another link.')}</p>
      <a className="auth-recovery-link" href="admin-setup-account.html"><i className="fas fa-user-plus" aria-hidden="true" /> {t('Resend my setup link')}</a>
      <a className="auth-recovery-link" href="admin-support.html"><i className="fas fa-life-ring" aria-hidden="true" /> Need help accessing your admin account? Send a support request.</a>
      <p className="auth-footnote auth-signout-hint"><LogoutIcon /> {t('Signed in before? Use the Log out symbol at the bottom of the workspace sidebar to end your session safely.')}</p>
      <p className="auth-footnote auth-rail-hint"><i className="fas fa-angles-left" aria-hidden="true" /> {t('Tip: the « button at the top of the sidebar shrinks it to icons, giving the page more room. Click » to bring the labels back.')}</p>
      <p className="auth-footnote"><i className="fas fa-lock" aria-hidden="true" /> {t('Secure sign-in · Administrator access only')}</p>
    </section>
    <footer className="auth-footer"><p>© {new Date().getFullYear()} · {t('Administrator access')}</p><p>Powered by KadeTech | <a href="tel:+250788950833">Contact</a></p></footer>
  </div></main>;
}

export function AdminPasswordResetPage() {
  const { t } = useLanguage();
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const isSetupRequest = !token && window.location.pathname.split('/').pop() === 'admin-setup-account.html';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [checkingLink, setCheckingLink] = useState(Boolean(token));
  const [linkValid, setLinkValid] = useState(!token);
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let current = true;
    apiFetch('/auth/password-reset/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
    })
      .then(async response => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.valid) throw new Error(result.error || 'This link has expired or already been used.');
        if (current) { setPurpose(result.purpose || 'reset'); setLinkValid(true); }
      })
      .catch(error => { if (current) { setLinkValid(false); setIsError(true); setFeedback(error.message || 'This link has expired or already been used.'); } })
      .finally(() => { if (current) setCheckingLink(false); });
    return () => { current = false; };
  }, [token]);

  async function submit(event) {
    event.preventDefault();
    if (token && password !== confirmation) { setIsError(true); setFeedback(t('The passwords do not match.')); return; }
    setBusy(true); setFeedback(''); setIsError(false);
    try {
      const requestPath = isSetupRequest ? '/auth/setup-link/request' : '/auth/password-reset/request';
      const response = await apiFetch(token ? '/auth/password-reset/confirm' : requestPath, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token, password } : { email: email.trim() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not complete this request. Please try again.');
      setIsError(false); setFeedback(t(result.message || 'Request completed.'));
      if (token) { setPassword(''); setConfirmation(''); setCompleted(true); }
      else setRequestSent(true);
    } catch (error) { setIsError(true); setFeedback(t(error.message || 'Could not complete this request.')); }
    finally { setBusy(false); }
  }

  const isSetup = purpose === 'setup' || isSetupRequest;
  const canSetPassword = Boolean(token && linkValid && !checkingLink);
  const showRequestForm = !token;

  return <main className="auth-page"><div className="auth-layout">
    <LanguageSelector />
    <a className="auth-back-link" href="admin-login.html"><i className="fas fa-arrow-left" aria-hidden="true" /> {t('Back to admin sign-in')}</a>
    <section className="auth-card" aria-labelledby="reset-title">
      <div className="auth-heading"><span className="auth-icon"><i className={`fas ${isSetup ? 'fa-user-check' : 'fa-key'}`} aria-hidden="true" /></span><p className="auth-eyebrow">{isSetup ? t('NEW ADMIN ACCOUNT') : t('ACCOUNT RECOVERY')}</p><h1 id="reset-title">{isSetupRequest ? t('Resend setup invitation') : isSetup ? t('Set up your password') : t(token ? 'Reset password' : 'Forgot password?')}</h1><p>{showRequestForm ? isSetupRequest ? t('Enter the email address that received your administrator invitation. We will send a new setup link if the invitation is still pending.') : t('Enter your admin email. If it belongs to an active administrator account, we will email a one-time password reset link.') : isSetup ? t('Choose a password to activate your administrator account.') : t('Choose a new password for your admin account.')}</p></div>
      {checkingLink ? <div className="auth-link-check" role="status"><i className="fas fa-spinner fa-spin" /> {t('Checking your secure link…')}</div>
        : completed || requestSent ? <div className="auth-complete"><span><i className="fas fa-circle-check" /></span><AuthFeedback>{feedback}</AuthFeedback>{requestSent && <p className="auth-delivery-hint">{isSetupRequest ? t('Check your inbox and spam folder. If no setup email arrives, contact the person who invited you.') : t('Check your inbox and spam folder. If no reset email arrives, contact the platform owner.')}</p>}<a className="auth-submit auth-submit-link" href="admin-login.html">{t('Continue to sign in')}<i className="fas fa-arrow-right" /></a>{requestSent && <button type="button" className="auth-secondary-link" onClick={() => { setRequestSent(false); setEmail(''); setFeedback(''); }}>{t('Use a different email')}</button>}</div>
          : token && !canSetPassword ? <div className="auth-link-expired"><AuthFeedback error={isError}>{feedback || t('This link has expired or already been used.')}</AuthFeedback><p>{t('Request a fresh setup or reset link with your admin email.')}</p><a className="auth-submit auth-submit-link" href={purpose === 'setup' ? 'admin-setup-account.html' : 'admin-reset-password.html'}>{t('Request a new link')}<i className="fas fa-arrow-right" /></a></div>
          : <form className="auth-form" onSubmit={submit}>
            {showRequestForm ? <><label htmlFor="reset-email">{t('Admin email')}</label><div className="auth-input-wrap"><i className="far fa-envelope" aria-hidden="true" /><input id="reset-email" name="email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} /></div></> : <>
              <label htmlFor="new-admin-password">{t('New password')}</label><div className="auth-input-wrap"><i className="fas fa-key" aria-hidden="true" /><input id="new-admin-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={1024} required value={password} onChange={event => setPassword(event.target.value)} /><button type="button" className="auth-password-visibility" aria-label={showPassword ? t('Hide password') : t('Show password')} onClick={() => setShowPassword(value => !value)}><i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} /></button></div><small className="auth-password-hint">{t('Use at least 8 characters. A longer, unique password is safer.')}</small>
              <label htmlFor="confirm-admin-password">{t('Confirm new password')}</label><div className="auth-input-wrap"><i className="fas fa-key" aria-hidden="true" /><input id="confirm-admin-password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={1024} required value={confirmation} onChange={event => setConfirmation(event.target.value)} /><button type="button" className="auth-password-visibility" aria-label={showConfirmation ? t('Hide password') : t('Show password')} onClick={() => setShowConfirmation(value => !value)}><i className={`far ${showConfirmation ? 'fa-eye-slash' : 'fa-eye'}`} /></button></div>
            </>}
            <AuthFeedback error={isError}>{feedback}</AuthFeedback>
            <button className="auth-submit" type="submit" disabled={busy}><span>{busy ? t('Please wait…') : showRequestForm ? isSetupRequest ? t('Resend setup email') : t('Send password reset link') : isSetup ? t('Set password and activate') : t('Save new password')}</span><i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`} aria-hidden="true" /></button>
            {token && !isError && feedback && <a className="auth-recovery-link" href="admin-login.html">{t('Return to sign in')}</a>}
          </form>}
      <p className="auth-footnote"><i className="fas fa-lock" aria-hidden="true" /> {t('Secure, one-time link · Expires after 30 minutes')}</p>
    </section>
  </div></main>;
}
