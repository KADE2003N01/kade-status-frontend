import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import TimedNotification from '../../components/TimedNotification.jsx';
import { platformOwnerRequest } from './platformOwnerApi.js';
import './PlatformOwnerPage.css';

const roles = [
  ['portfolio_owner', 'Portfolio owner'],
  ['content_manager', 'Content manager'],
  ['document_manager', 'Document manager'],
  ['download_manager', 'Download manager'],
  ['profile_manager', 'Profile manager']
];

function sessionToken() {
  try { return window.sessionStorage.getItem('kade-admin-session-token') || ''; } catch { return ''; }
}

export default function PlatformOwnerPage() {
  const [owner, setOwner] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activitySearchInput, setActivitySearchInput] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [deletingAuditId, setDeletingAuditId] = useState(null);
  const [deletingAllAudit, setDeletingAllAudit] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ displayName: '', email: '', phone: '', role: 'portfolio_owner' });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const dismissNotice = useCallback(() => setNotice(''), []);
  const dismissError = useCallback(() => setError(''), []);

  const loadAdmins = useCallback(async (nextPage = page, nextSearch = search, nextStatus = statusFilter) => {
    const params = new URLSearchParams({ page: String(nextPage) });
    if (nextSearch) params.set('search', nextSearch);
    if (nextStatus !== 'all') params.set('status', nextStatus);
    const result = await platformOwnerRequest(`/admins?${params}`);
    setAdmins(result.admins || []);
    setCounts(result.counts || { total: 0, active: 0, pending: 0, inactive: 0 });
    setTotalPages(result.totalPages || 1);
    setPage(result.page || nextPage);
  }, [page, search, statusFilter]);

  const loadAudit = useCallback(async () => {
    const result = await platformOwnerRequest('/audit');
    setAuditEvents(result.events || []);
  }, []);

  const visibleAuditEvents = auditEvents.filter((event) =>
    `${event.action || ''} ${event.actorEmail || ''} ${event.targetEmail || ''} ${JSON.stringify(event.details || {})} ${event.createdAt || ''}`
      .toLowerCase().includes(activitySearch.toLowerCase())
  );

  async function deleteAuditEvent(event) {
    if (!window.confirm(`Delete this ${event.action.replaceAll('_', ' ')} activity record?`)) return;
    setDeletingAuditId(event.id); setError(''); setNotice('');
    try {
      const result = await platformOwnerRequest(`/audit/${event.id}`, { method: 'DELETE' });
      setAuditEvents(current => current.filter(item => item.id !== event.id));
      setNotice(result.message || 'Activity record deleted.');
    } catch (requestError) { setError(requestError.message || 'Could not delete activity record.'); }
    finally { setDeletingAuditId(null); }
  }

  async function deleteAllAudit() {
    if (!auditEvents.length || !window.confirm('Delete all recent access activity records? This cannot be undone.')) return;
    setDeletingAllAudit(true); setError(''); setNotice('');
    try {
      const result = await platformOwnerRequest('/audit', { method: 'DELETE' });
      setAuditEvents([]);
      setNotice(result.message || 'All activity records deleted.');
    } catch (requestError) { setError(requestError.message || 'Could not delete activity records.'); }
    finally { setDeletingAllAudit(false); }
  }

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const response = await apiFetch('/auth/me', { credentials: 'include', headers: sessionToken() ? { Authorization: `Bearer ${sessionToken()}` } : undefined });
        if (response.status === 401) { window.location.replace('admin-login.html?next=platform-owner.html'); return; }
        const result = await response.json();
        if (result.user?.role !== 'platform_owner') { setError('This console is available only to the super-admin account.'); setLoading(false); return; }
        if (current) setOwner(result.user);
      } catch (requestError) {
        if (current) setError(requestError.message || 'Could not verify super-admin access.');
      } finally {
        if (current) setLoading(false);
      }
    })();
    return () => { current = false; };
  }, []);

  useEffect(() => {
    if (!owner) return;
    let current = true;
    loadAudit().catch((requestError) => { if (current) setError(requestError.message || 'Could not load access history.'); });
    return () => { current = false; };
  }, [owner, loadAudit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!owner) return;
    loadAdmins(page, search, statusFilter).catch((requestError) => setError(requestError.message));
  }, [owner, page, search, statusFilter, loadAdmins]);

  async function submitInvite(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const result = await platformOwnerRequest('/admins', { method: 'POST', body: JSON.stringify(form) });
      setNotice(result.message || 'Invitation sent.');
      setForm({ displayName: '', email: '', phone: '', role: 'portfolio_owner' });
      setSearchInput(''); setSearch(''); setStatusFilter('all'); setPage(1);
      await loadAdmins(1, '', 'all');
      await loadAudit();
      document.getElementById('invite-admin')?.removeAttribute('open');
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function updateAdmin(id, path, body, success) {
    setBusy(true); setError(''); setNotice('');
    const previousAdmin = admins.find(admin => String(admin.id) === String(id));
    if (path === 'status' && previousAdmin) {
      setAdmins(current => current.map(admin => String(admin.id) === String(id) ? { ...admin, status: body.status } : admin));
      setCounts(current => ({
        ...current,
        [previousAdmin.status]: Math.max(0, current[previousAdmin.status] - 1),
        [body.status]: current[body.status] + 1
      }));
    }
    try {
      const method = path === 'password-reset' ? 'POST' : path === 'delete' ? 'DELETE' : 'PATCH';
      const result = await platformOwnerRequest(`/admins/${id}${path === 'delete' ? '' : `/${path}`}`, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      setNotice(result.message || success);
      if (result.admin) {
        setAdmins(current => current.map(admin => String(admin.id) === String(id)
          ? { ...admin, ...result.admin, ...(path === 'status' ? { status: body.status } : {}) }
          : admin));
      }
      if (path === 'delete') {
        setAdmins(current => current.filter(admin => admin.id !== id));
        setCounts(current => ({ ...current, total: Math.max(0, current.total - 1) }));
      }
      try {
        // Keep a status-updated row where it is in the All accounts view. The
        // API sorts active accounts first, so reloading here would move the row
        // away just after the switch changes and make the action look undone.
        if (path !== 'status' || statusFilter !== 'all') await loadAdmins();
        await loadAudit();
      } catch (refreshError) {
        setError(`The change was saved, but the latest account activity could not be refreshed: ${refreshError.message}`);
      }
    } catch (requestError) {
      if (path === 'status' && previousAdmin) {
        setAdmins(current => current.map(admin => String(admin.id) === String(id) ? { ...admin, status: previousAdmin.status } : admin));
        setCounts(current => ({
          ...current,
          [body.status]: Math.max(0, current[body.status] - 1),
          [previousAdmin.status]: current[previousAdmin.status] + 1
        }));
      }
      setError(requestError.message);
    }
    finally { setBusy(false); }
  }

  async function signOut() {
    try {
      await apiFetch('/auth/logout', { method: 'POST', credentials: 'include', headers: sessionToken() ? { Authorization: `Bearer ${sessionToken()}` } : undefined });
    } finally {
      try { window.sessionStorage.removeItem('kade-admin-session-token'); } catch { /* Continue to sign-in. */ }
      window.location.replace('admin-login.html');
    }
  }

  if (loading) return <main className="owner-page owner-loading">Checking super-admin access…</main>;
  if (!owner) return <main className="owner-page"><section className="owner-card owner-denied"><h1>Super-admin access required</h1><p>{error || 'Sign in with the super-admin account to continue.'}</p><a className="owner-button owner-button-primary" href="admin-login.html?next=platform-owner.html">Go to sign in</a></section></main>;

  return <main className="owner-page">
    <header className="owner-topbar"><a className="owner-brand" href="platform-owner.html"><span className="owner-brand-icon"><i className="fas fa-shield-halved" /></span><span>Platform Owner<small>Owner console</small></span></a><nav className="owner-top-actions" aria-label="Admin navigation"><a href="admin-accounts.html">Admin directory</a><a href="admin.html">Portfolio workspace</a><button type="button" onClick={signOut}>Sign out</button></nav></header>
    <section className="owner-welcome"><div><p className="owner-eyebrow">CONTROL CENTER</p><h1>Manage access</h1><p>Welcome, {owner.displayName}. Invite administrators and manage their access from one place.</p></div><details className="owner-invite" id="invite-admin"><summary><i className="fas fa-user-plus" /> Invite administrator</summary><form onSubmit={submitInvite}>
      <div className="owner-invite-heading"><div><strong>Invite an administrator</strong><small>Send a secure setup link after confirming the customer’s payment.</small></div><button className="owner-invite-close" type="button" aria-label="Close invitation form" title="Close" onClick={() => { document.getElementById('invite-admin')?.removeAttribute('open'); }}><i className="fas fa-xmark" /></button></div>
      <label>Full name<input required maxLength="120" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} /></label>
      <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
      <label>Phone <span>(optional)</span><input maxLength="40" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
      <label>Access role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <p className="owner-form-hint">The invitation is sent by email. The admin sets their own password from the one-time link.</p><button className="owner-button owner-button-primary" disabled={busy}>{busy ? 'Sending…' : 'Send invitation'}</button>
    </form></details></section>

    {notice && <TimedNotification message={notice} tone="success" onClose={dismissNotice} />}
    {error && <TimedNotification message={error} tone="error" onClose={dismissError} />}

    <section className="owner-stat-grid" aria-label="Admin account totals">
      <article className="owner-stat"><span className="owner-stat-icon blue"><i className="fas fa-users" /></span><div><small>All admins</small><strong>{counts.total}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon green"><i className="fas fa-circle-check" /></span><div><small>Active</small><strong>{counts.active}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon amber"><i className="fas fa-envelope-open-text" /></span><div><small>Invited</small><strong>{counts.pending}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon gray"><i className="fas fa-user-slash" /></span><div><small>Inactive</small><strong>{counts.inactive}</strong></div></article>
    </section>

    <section className="owner-card owner-directory"><div className="owner-section-heading"><div><p className="owner-eyebrow">ACCOUNT ACCESS</p><h2>Administrators</h2></div><span>{counts.total} accounts</span></div>
      <div className="owner-filters"><label className="owner-search"><i className="fas fa-magnifying-glass" /><input type="search" placeholder="Search by name or email" value={searchInput} onChange={event => setSearchInput(event.target.value)} /></label><label className="owner-status-filter"><span>Status</span><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All accounts</option><option value="active">Active</option><option value="pending">Invited</option><option value="inactive">Inactive</option></select></label></div>
      <div className="owner-table-wrap"><div className="owner-table-scroll"><table className="owner-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th className="owner-actions-heading">Actions</th></tr></thead><tbody>{admins.map(admin => <tr key={admin.id}>
        <td className="owner-name-cell"><strong>{admin.displayName}</strong></td>
        <td className="owner-email-cell">{admin.email}</td>
        <td className="owner-phone-cell">{admin.phone || <span>Not provided</span>}</td>
        <td>{admin.role === 'platform_owner' ? <span className="owner-super-badge"><i className="fas fa-shield-halved" /> Super admin</span> : <select className="owner-role-select" aria-label={`Role for ${admin.displayName}`} value={admin.role} disabled={busy} onChange={e => updateAdmin(admin.id, 'role', { role: e.target.value }, 'Role updated.')}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
        <td className={`owner-status-column ${admin.status === 'active' ? 'is-active' : admin.status === 'inactive' ? 'is-inactive' : 'is-pending'}`}><div className="owner-status-cell">{admin.role === 'platform_owner' ? <span className="owner-protected-status">Protected</span> : admin.status === 'pending' ? <span className="owner-status-pill pending">Invitation pending</span> : <><button type="button" role="switch" aria-checked={admin.status === 'active'} aria-label={`${admin.status === 'active' ? 'Deactivate' : 'Activate'} ${admin.displayName}`} className={`owner-status-toggle ${admin.status === 'active' ? 'is-on' : 'is-off'}`} disabled={busy} onClick={() => { const nextStatus = admin.status === 'active' ? 'inactive' : 'active'; updateAdmin(admin.id, 'status', { status: nextStatus }, nextStatus === 'active' ? 'Account activated.' : 'Account deactivated.'); }}><span className="owner-status-toggle-knob" /></button><span className={`owner-status-label ${admin.status}`}>{admin.status === 'active' ? 'Active' : 'Inactive'}</span></>}</div></td>
        <td><div className="owner-row-actions"><button className="owner-action-button delete" disabled={busy || admin.role === 'platform_owner'} onClick={() => { if (window.confirm(`Permanently delete ${admin.displayName} (${admin.email})? This removes their admin login, not portfolio content.`)) updateAdmin(admin.id, 'delete', null, 'Administrator account deleted.'); }}>Delete</button></div></td>
      </tr>)}</tbody></table>{admins.length === 0 && <div className="owner-empty"><i className="fas fa-user-magnifying-glass" /><strong>No administrators found</strong><span>Try another search or status filter.</span></div>}</div></div>
      <footer className="owner-pagination"><span>Page {page} of {totalPages}</span><div><button disabled={page <= 1 || busy} onClick={() => setPage(value => Math.max(1, value - 1))}><i className="fas fa-chevron-left" /> Previous</button><button disabled={page >= totalPages || busy} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Next <i className="fas fa-chevron-right" /></button></div></footer>
    </section>

    <details className="owner-card owner-audit"><summary><span><i className="fas fa-clock-rotate-left" /> Recent access activity</span><small>Latest {auditEvents.length} changes</small></summary><div className="owner-audit-body"><form className="owner-audit-search" onSubmit={event => { event.preventDefault(); setActivitySearch(activitySearchInput.trim().toLowerCase()); }}><label><i className="fas fa-magnifying-glass" /><input type="search" value={activitySearchInput} onChange={event => { setActivitySearchInput(event.target.value); setActivitySearch(event.target.value.trim().toLowerCase()); }} placeholder="Search activity, admin, or email" aria-label="Search access activity" /></label><button type="submit">Search</button><button className="owner-audit-delete-all" type="button" disabled={!auditEvents.length || deletingAllAudit || deletingAuditId !== null} onClick={deleteAllAudit}><i className="fas fa-trash-can" /> {deletingAllAudit ? 'Deleting…' : 'Delete all'}</button></form>{auditEvents.length ? visibleAuditEvents.length ? <ul>{visibleAuditEvents.map(event => <li key={event.id}><span className="owner-audit-dot" /><div><strong>{event.action.replaceAll('_', ' ')}</strong><small>{event.actorEmail || 'System'} {event.targetEmail ? ` · ${event.targetEmail}` : ''}</small></div><time>{new Date(event.createdAt).toLocaleString()}</time><button type="button" className="owner-audit-delete" aria-label={`Delete ${event.action.replaceAll('_', ' ')} activity`} title="Delete activity" disabled={deletingAllAudit || deletingAuditId !== null} onClick={() => deleteAuditEvent(event)}><i className={`fas ${deletingAuditId === event.id ? 'fa-spinner fa-spin' : 'fa-trash-can'}`} /></button></li>)}</ul> : <p className="owner-audit-empty">No activity matches your search.</p> : <p className="owner-audit-empty">No access changes recorded yet.</p>}</div></details>
    <p className="owner-data-note"><i className="fas fa-circle-info" /> Roles currently apply to this shared portfolio. Per-customer data separation is part of the next multi-tenant phase.</p>
  </main>;
}
