import React, { useState } from 'react';
import { apiFetch } from '../../../services/api.js';
import LanguageSelector from '../../../components/LanguageSelector.jsx';
import './AdminAuthPages.css';

export default function AdminSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'sign_in', message: '' });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setFeedback(null);
    try {
      const response = await apiFetch('/support-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not send the support request.');
      setFeedback({ text: result.message || 'Your request was sent to the platform owner.', error: false });
      setForm({ ...form, message: '' });
    } catch (error) { setFeedback({ text: error.message || 'Could not reach support. Try again later.', error: true }); }
    finally { setBusy(false); }
  }

  return <main className="auth-page"><div className="auth-layout">
    <LanguageSelector />
    <a className="auth-back-link" href="admin-login.html"><i className="fas fa-arrow-left" aria-hidden="true" /> Back to sign in</a>
    <section className="auth-card admin-support-card" aria-labelledby="support-title">
      <div className="auth-heading"><span className="auth-icon"><i className="fas fa-life-ring" aria-hidden="true" /></span><p className="auth-eyebrow">ADMINISTRATOR HELP</p><h1 id="support-title">Request support</h1><p>Tell the platform owner what is preventing you from accessing or using your account.</p></div>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="support-name">Your name</label><input id="support-name" autoComplete="name" maxLength="120" required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
        <label htmlFor="support-email">Administrator email</label><input id="support-email" type="email" autoComplete="email" maxLength="254" required value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
        <label htmlFor="support-category">What do you need help with?</label><select id="support-category" value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option value="sign_in">Sign-in problem</option><option value="inactive_account">Inactive account</option><option value="password_reset">Forgot or reset password</option><option value="setup_link">Invitation or setup link</option><option value="other">Something else</option></select>
        <label htmlFor="support-message">Describe the issue</label><textarea id="support-message" rows="5" minLength="10" maxLength="3000" required value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} />
        {feedback && <p className={`auth-feedback${feedback.error ? ' error' : ''}`} role="status" aria-live="polite">{feedback.text}</p>}
        <button className="auth-submit" type="submit" disabled={busy}><span>{busy ? 'Sending…' : 'Send support request'}</span><i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`} aria-hidden="true" /></button>
      </form>
    </section>
  </div></main>;
}
