import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import TimedNotification from '../../components/TimedNotification.jsx';
import { platformOwnerRequest } from './platformOwnerApi.js';
import OwnerMessages from './OwnerMessages.jsx';
import LogoutIcon from '../../components/LogoutIcon.jsx';
import './PlatformOwnerPage.css';

const roles = [
  ['platform_owner', 'Super admin · full access'],
  ['portfolio_owner', 'Portfolio owner'],
  ['content_manager', 'Content manager'],
  ['document_manager', 'Document manager'],
  ['download_manager', 'Download manager'],
  ['profile_manager', 'Profile manager']
];
const bulkActionInfo = {
  delete_all: { title: 'Delete all customer admins', phrase: 'DELETE ALL', detail: 'This permanently removes every customer admin account, including active, inactive, and pending accounts. Super-admin accounts are protected.' },
  activate_all: { title: 'Activate all customer admins', phrase: 'ACTIVATE ALL', detail: 'This activates inactive customer admin accounts. Pending invitations and super-admin accounts are unchanged.' },
  deactivate_all: { title: 'Deactivate all customer admins', phrase: 'DEACTIVATE ALL', detail: 'This deactivates active customer admin accounts and ends their current sessions. Pending invitations and super-admin accounts are unchanged.' },
  reset_passwords: { title: 'Send password links to all customer admins', phrase: 'RESET PASSWORDS', detail: 'Active admins receive password-reset links and pending admins receive setup links. Inactive accounts and super-admin accounts are skipped.' },
  assign_roles_all: { title: 'Assign roles to all customer admins', phrase: 'ASSIGN ROLES', detail: 'This replaces the current roles of every customer admin account with the selected role set. Super-admin accounts are not changed.' }
};

function formatActivityName(action = '') {
  return action.replaceAll('_', ' ');
}

function formatActivityTime(value) {
  if (!value) return 'Time unavailable';
  const parsed = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function sessionToken() {
  try { return window.sessionStorage.getItem('kade-admin-session-token') || ''; } catch { return ''; }
}

export default function PlatformOwnerPage() {
  const [locationHash, setLocationHash] = useState(() => window.location.hash);
  const [directoryView, setDirectoryView] = useState(() => ['#admin-directory', '#recent-activity'].includes(window.location.hash));
  const [requestsView, setRequestsView] = useState(() => window.location.hash === '#requests');
  const [messagesView, setMessagesView] = useState(() => window.location.hash === '#messages');
  const [owner, setOwner] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [inboxCounts, setInboxCounts] = useState({ requests: 0, messages: 0, messagesIncoming: 0, messagesOutgoing: 0 });
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
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
  const [form, setForm] = useState({ displayName: '', email: '', phone: '', roles: ['portfolio_owner'] });
  const [busy, setBusy] = useState(false);
  const [editingRolesId, setEditingRolesId] = useState(null);
  const [draftRoles, setDraftRoles] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkPhrase, setBulkPhrase] = useState('');
  const [bulkRoles, setBulkRoles] = useState(['portfolio_owner']);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpPage, setHelpPage] = useState('faq');
  const [railCollapsed, setRailCollapsed] = useState(() => {
    try {
      // Start collapsed when arriving from the admin workspace (or any page other
      // than the owner console itself), so the console opens wide on first paint.
      const referrer = document.referrer || '';
      const fromAdminWorkspace = referrer.includes('admin.html') && !referrer.includes('platform-owner.html');
      if (fromAdminWorkspace) return true;
      return window.localStorage.getItem('kade-owner-rail') === 'collapsed';
    } catch { return false; }
  });

  useEffect(() => {
    try { window.localStorage.setItem('kade-owner-rail', railCollapsed ? 'collapsed' : 'open'); } catch { /* ignore */ }
  }, [railCollapsed]);
  const [theme, setTheme] = useState(() => { try { return window.localStorage.getItem('kade-owner-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const dismissNotice = useCallback(() => setNotice(''), []);
  const dismissError = useCallback(() => setError(''), []);

  useEffect(() => {
    const syncView = () => {
      setLocationHash(window.location.hash);
      setDirectoryView(['#admin-directory', '#recent-activity'].includes(window.location.hash));
      setRequestsView(window.location.hash === '#requests');
      setMessagesView(window.location.hash === '#messages');
      setNavOpen(false);
      setToolsOpen(false);
      setHelpOpen(false);
    };
    window.addEventListener('hashchange', syncView);
    window.addEventListener('click', handleOutsideClick);
    return () => { window.removeEventListener('hashchange', syncView); window.removeEventListener('click', handleOutsideClick); };
  }, [toolsOpen, helpOpen]);

  function handleOutsideClick(event) {
    if (!toolsOpen && !helpOpen) return;
    if (event.target.closest?.('.owner-tools-menu, .owner-mobile-tools-trigger')) return;
    setToolsOpen(false);
    setHelpOpen(false);
  }

  function collapseOwnerNavigation() {
    setNavOpen(false);
    setRailCollapsed(true);
    try { window.localStorage.setItem('kade-owner-rail', 'collapsed'); } catch { /* Keep navigation available when storage is disabled. */ }
  }

  const chatTools = [
    { href: '#recent-activity', icon: 'fa-clock-rotate-left', label: 'Recent activity' },
    { href: '#admin-directory', icon: 'fa-users-gear', label: 'Admin directory' },
    { href: '#support-requests', icon: 'fa-life-ring', label: 'Support inbox' },
    { href: 'admin.html', icon: 'fa-briefcase', label: 'Portfolio workspace' },
    { href: '#messages', icon: 'fa-comment', label: 'Chat room' }
  ];

  const ownerHelpGuide = [
    { title: '1 · Overview dashboard', body: 'The landing page shows live totals of every admin account: all, active, invited, and inactive. Use it as your daily health check before working in any section.' },
    { title: '2 · Inviting an administrator', body: 'Open Admin accounts, click Invite administrator, and fill in the name, email, and access roles. After confirming the customer payment, sending the form emails them a one-time setup link to create their own password.' },
    { title: '3 · Managing access', body: 'Each account row has a status toggle to activate or deactivate access instantly. Deactivated accounts cannot sign in, and their current sessions end immediately.' },
    { title: '4 · Roles and permissions', body: 'Roles control what each admin can reach: Portfolio owner, Content manager, Document manager, Download manager, and Profile manager. Super admin has every permission and is always protected from bulk actions.' },
    { title: '5 · Password and setup links', body: 'Pending accounts receive setup links; active accounts receive password-reset links. Send them from any account row, or use "Reset passwords all" to email every active customer admin at once.' },
    { title: '6 · Bulk actions', body: 'Activate all, Deactivate all, Reset passwords all, Assign roles all, and Delete all target customer admins only — super-admin accounts are always skipped for safety. Destructive actions require typing a confirmation phrase.' },
    { title: '7 · Chat room', body: 'Open Chat to message admins privately or broadcast to all active admins or a whole role. Each message stores its own reply permission, and the muted-admins panel lets you allow or stop replies per admin or role.' },
    { title: '8 · Support requests', body: 'When an admin reports a sign-in or account problem, it lands in Requests. Fix the underlying issue, then click Mark resolved to clear it from the inbox.' },
    { title: '9 · Security history', body: 'Every access change is recorded in Recent access activity below the admins table. Search it by action, admin, or email, and delete individual records or clear all history when needed.' },
    { title: '10 · Data today and next', body: 'Roles currently apply to this shared portfolio. Per-customer data separation arrives with the next multi-tenant phase, so one customer’s admin will only ever see their own content.' }
  ];

  const chatHelpTopics = [
    { title: 'Start a private chat', body: 'Pick an admin from the conversation list on the left, then type your message and press Send.' },
    { title: 'Broadcast a message', body: 'Choose "All active admins" or a role in the Send-to selector so one copy lands in every matching conversation.' },
    { title: 'Control replies', body: 'Use the reply toggles to allow or stop admin replies, or open the muted-admins panel to manage access per admin or role.' },
    { title: 'Attach files, images, or voice notes', body: 'Use the attachment buttons next to the composer to add files, photos, or a recorded voice note before sending.' },
    { title: 'Manage sent messages', body: 'Open Manage to select and clear sent messages, or edit and clear any bubble from its own controls.' }
  ];

  useEffect(() => {
    if (!directoryView) return;
    const targetId = locationHash === '#recent-activity' ? 'recent-activity' : locationHash === '#requests' ? 'support-requests' : locationHash === '#messages' ? 'owner-messages' : 'admin-directory';
    window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ block: 'start' }));
  }, [directoryView, requestsView, locationHash]);

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

  const loadOwnerInbox = useCallback(async () => {
    const [countResult, requestResult] = await Promise.all([
      platformOwnerRequest('/inbox-counts'),
      platformOwnerRequest('/support-requests')
    ]);
    setInboxCounts({ requests: countResult.requests || 0, messages: countResult.messages || 0, messagesIncoming: countResult.messagesIncoming || 0, messagesOutgoing: countResult.messagesOutgoing || 0 });
    setSupportRequests(requestResult.requests || []);
  }, []);

  const refreshInbox = useCallback(() => {
    loadOwnerInbox().catch((requestError) => setError(requestError.message));
  }, [loadOwnerInbox]);

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

  async function updateSupportRequest(request, status) {
    setUpdatingRequestId(request.id); setError(''); setNotice('');
    try {
      const result = await platformOwnerRequest(`/support-requests/${request.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setNotice(result.message || 'Support request updated.');
      await loadOwnerInbox();
    } catch (requestError) { setError(requestError.message || 'Could not update support request.'); }
    finally { setUpdatingRequestId(null); }
  }

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const response = await apiFetch('/auth/me', { credentials: 'include', headers: sessionToken() ? { Authorization: `Bearer ${sessionToken()}` } : undefined });
        if (response.status === 401) { window.location.replace('admin-login.html?next=platform-owner.html'); return; }
        const result = await response.json();
        if (!(result.user?.roles || [result.user?.role]).includes('platform_owner')) { setError('This console is available only to the super-admin account.'); setLoading(false); return; }
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
    try { window.localStorage.setItem('kade-owner-theme', theme); } catch { /* Private browsing can refuse storage. */ }
  }, [theme]);

  useEffect(() => {
    if (!owner) return;
    let current = true;
    Promise.all([loadAudit(), loadOwnerInbox()]).catch((requestError) => { if (current) setError(requestError.message || 'Could not load owner activity.'); });
    return () => { current = false; };
  }, [owner, loadAudit, loadOwnerInbox]);

  useEffect(() => {
    if (!owner) return undefined;
    const timer = window.setInterval(() => loadOwnerInbox().catch(() => {}), 30000);
    return () => window.clearInterval(timer);
  }, [owner, loadOwnerInbox]);

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
      setForm({ displayName: '', email: '', phone: '', roles: ['portfolio_owner'] });
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
      if (path === 'roles') setEditingRolesId(null);
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

  async function runBulkAction() {
    if (!bulkAction) return;
    if (bulkAction !== 'assign_roles_all' && bulkPhrase !== bulkActionInfo[bulkAction]?.phrase) return;
    if (bulkAction === 'assign_roles_all' && (!bulkRoles.length || bulkRoles.some((role) => !roles.some(([value]) => value === role)))) {
      setError('Choose at least one valid role to assign.');
      return;
    }
    setBulkBusy(true); setError(''); setNotice('');
    try {
      const result = await platformOwnerRequest('/admins/bulk-action', {
        method: 'POST',
        body: JSON.stringify(bulkAction === 'assign_roles_all' ? { action: bulkAction, roles: bulkRoles } : { action: bulkAction })
      });
      setNotice(result.message || 'Bulk action completed.');
      setBulkAction(''); setBulkPhrase(''); setBulkRoles(['portfolio_owner']);
      await Promise.all([loadAdmins(), loadAudit()]);
    } catch (requestError) {
      setError(requestError.message || 'Could not complete the bulk action.');
    } finally {
      setBulkBusy(false);
    }
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

  return <main className={`owner-page owner-console${messagesView ? ' owner-messages-page' : ''}${railCollapsed ? ' owner-rail-collapsed' : ''}`} data-theme={theme}>
    <aside className={`owner-sidebar${navOpen ? ' is-nav-open' : ''}`} aria-label="Platform owner navigation">
      <div className="owner-sidebar-top">
        <a className="owner-brand" href="platform-owner.html"><span className="owner-brand-icon"><i className="fas fa-shield-halved" /></span><span>Platform Owner<small>Owner console</small></span></a>
        <button className="owner-rail-toggle" type="button" aria-pressed={railCollapsed} aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setRailCollapsed((collapsed) => !collapsed)}><i className={`fas ${railCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`} /></button>
        <button className="owner-nav-toggle" type="button" aria-expanded={navOpen} aria-controls="owner-sidebar-nav" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} title={navOpen ? 'Close navigation' : 'Open navigation'} onClick={() => { setNavOpen((open) => !open); if (navOpen) { setToolsOpen(false); setHelpOpen(false); } }}><i className={`fas ${navOpen ? 'fa-xmark' : 'fa-bars'}`} /></button>
      </div>
      {navOpen && <button className="owner-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
      <nav id="owner-sidebar-nav" className="owner-sidebar-nav">
        <div className="owner-mobile-nav-heading"><p className="owner-sidebar-label">WORKSPACE</p></div>
        <a className={!directoryView && !requestsView && !messagesView ? 'is-current' : ''} href="platform-owner.html" title="Overview" onClick={collapseOwnerNavigation}><i className="fas fa-chart-pie" /><span>Overview</span></a>
        <a className={directoryView ? 'is-current' : ''} href="#admin-directory" title="Admin accounts" onClick={collapseOwnerNavigation}><i className="fas fa-users-gear" /><span>Admin accounts</span></a>
        <a className={requestsView ? 'is-current' : ''} href="#requests" title="Requests" onClick={collapseOwnerNavigation}><i className="fas fa-life-ring" /><span>Requests</span><span className="owner-sidebar-count">{inboxCounts.requests}</span></a>
        <a className={messagesView ? 'is-current' : ''} href="#messages" title="Chat" onClick={collapseOwnerNavigation}><i className="fas fa-comment" /><span>Chat</span><span className="owner-sidebar-count owner-sidebar-message-count" aria-label={`${inboxCounts.messagesIncoming} incoming messages and ${inboxCounts.messagesOutgoing} outgoing messages`}><span><i className="fas fa-arrow-down" aria-hidden="true" /> {inboxCounts.messagesIncoming}</span><span><i className="fas fa-arrow-up" aria-hidden="true" /> {inboxCounts.messagesOutgoing}</span></span></a>
        <a href="admin.html" title="Portfolio workspace" onClick={collapseOwnerNavigation}><i className="fas fa-briefcase" /><span>Portfolio workspace</span></a>
        <button className={`owner-mobile-tools-trigger${toolsOpen ? ' is-active' : ''}`} type="button" aria-expanded={toolsOpen} aria-controls="owner-tools-panel" onClick={() => { setToolsOpen((open) => !open); setHelpOpen(false); }}><i className={`fas ${toolsOpen ? 'fa-xmark' : 'fa-sliders'}`} aria-hidden="true" /><span>Tools</span></button>
        <button className="owner-mobile-theme-trigger" type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}><i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" /><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
        <button className="owner-sidebar-signout" type="button" title="Sign out" onClick={signOut}><LogoutIcon /><span>Sign out</span></button>
      </nav>
    </aside>
    <div className="owner-main">
    <section className="owner-welcome"><div className="owner-welcome-heading"><div><p className="owner-eyebrow">{requestsView ? 'SYSTEM SUPPORT' : messagesView ? 'CHAT ROOM' : directoryView ? 'ADMIN ACCESS' : 'CONTROL CENTER'}</p><h1>{requestsView ? 'Support requests' : messagesView ? 'Chat' : directoryView ? 'Manage administrator access' : `Welcome, ${owner.displayName}`}</h1><p>{requestsView ? 'Review sign-in, account activation, setup-link, and password-recovery issues reported by administrators.' : messagesView ? 'Chat privately or broadcast to all customer admins, and control whether each admin can reply.' : directoryView ? 'Invite administrators, set their roles, manage account access, and review recent security activity.' : 'This is your owner dashboard. Get a quick overview, then open Admin accounts to manage invitations, roles, password links, and activity.'}</p></div><div className="owner-top-corner">
        <div className="owner-tools-menu">
          <button className="owner-tools-button" type="button" aria-expanded={toolsOpen} aria-label={toolsOpen ? 'Close workspace tools' : 'Open workspace tools'} title="Workspace tools" onClick={(event) => { event.stopPropagation(); setToolsOpen((open) => !open); setHelpOpen(false); }}><i className={`fas ${toolsOpen ? 'fa-xmark' : 'fa-sliders'}`} /><span>Tools</span></button>
          {toolsOpen && <div id="owner-tools-panel" className="owner-tools-panel" role="menu" aria-label="Workspace links">
            <div className="owner-tools-heading-row"><p className="owner-tools-heading">MORE PAGES &amp; TOOLS</p><button type="button" className="owner-dropdown-close" aria-label="Close workspace tools" title="Close" onClick={() => setToolsOpen(false)}><i className="fas fa-xmark" aria-hidden="true" /></button></div>
            <button type="button" role="menuitem" disabled title="Coming soon"><i className="fas fa-gear" /> Settings</button>
            <button type="button" role="menuitem" disabled title="Coming soon"><i className="fas fa-credit-card" /> Plans &amp; billing</button>
            <button type="button" role="menuitem" disabled title="Coming soon"><i className="fas fa-building-user" /> Customers</button>
            <button type="button" role="menuitem" disabled title="Coming soon"><i className="fas fa-chart-line" /> Reports</button>
            <button type="button" role="menuitem" onClick={() => { setToolsOpen(false); setHelpOpen(true); setHelpPage('guide'); }}><i className="fas fa-book" /> Documentation</button>
            <button type="button" role="menuitem" onClick={() => { setToolsOpen(false); setHelpOpen(true); setHelpPage('faq'); }}><i className="fas fa-circle-question" /> Help &amp; FAQ</button>
          </div>}
          {helpOpen && <div className="owner-tools-panel owner-help-panel" role="dialog" aria-label="Help and frequently asked questions">
            <div className="owner-help-heading"><strong>{helpPage === 'guide' ? 'Documentation' : 'Help & FAQ'}</strong><button type="button" aria-label="Close help" title="Close" onClick={() => setHelpOpen(false)}><i className="fas fa-xmark" /></button></div>
            <div className="owner-help-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={helpPage === 'guide'} className={helpPage === 'guide' ? 'is-active' : ''} onClick={() => setHelpPage('guide')}>How it works</button>
              <button type="button" role="tab" aria-selected={helpPage === 'faq'} className={helpPage === 'faq' ? 'is-active' : ''} onClick={() => setHelpPage('faq')}>FAQ</button>
            </div>
            {helpPage === 'guide' ? ownerHelpGuide.map((section) => <article key={section.title}><strong>{section.title}</strong><p>{section.body}</p></article>) : chatHelpTopics.map((topic) => <article key={topic.title}><strong>{topic.title}</strong><p>{topic.body}</p></article>)}
          </div>}
        </div>
        {directoryView && <details className="owner-invite" id="invite-admin"><summary><i className="fas fa-user-plus" /> Invite administrator</summary><form onSubmit={submitInvite}>
      <div className="owner-invite-heading"><div><strong>Invite an administrator</strong><small>Send a secure setup link after confirming the customer’s payment.</small></div><button className="owner-invite-close" type="button" aria-label="Close invitation form" title="Close" onClick={() => { document.getElementById('invite-admin')?.removeAttribute('open'); }}><i className="fas fa-xmark" /></button></div>
      <label>Full name<input required maxLength="120" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} /></label>
      <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
      <label>Phone <span>(optional)</span><input maxLength="40" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
      <fieldset className="owner-role-checks"><legend>Access roles</legend>{roles.map(([value, label]) => <label key={value}><input type="checkbox" checked={form.roles.includes(value)} onChange={event => setForm(current => ({ ...current, roles: event.target.checked ? [...current.roles, value] : current.roles.filter(role => role !== value) }))} /> <span>{label}</span></label>)}<small>Choose one or more roles. Super admin includes every permission.</small></fieldset>
      <p className="owner-form-hint">The invitation is sent by email. The admin sets their own password from the one-time link.</p><button className="owner-button owner-button-primary" disabled={busy}>{busy ? 'Sending…' : 'Send invitation'}</button>
    </form></details>}</div></div></section>

    {notice && <TimedNotification message={notice} tone="success" onClose={dismissNotice} />}
    {error && <TimedNotification message={error} tone="error" onClose={dismissError} />}

    {!directoryView && !requestsView && !messagesView && <section className="owner-stat-grid" aria-label="Admin account totals">
      <article className="owner-stat"><span className="owner-stat-icon blue"><i className="fas fa-users" /></span><div><small>All admins</small><strong>{counts.total}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon green"><i className="fas fa-circle-check" /></span><div><small>Active</small><strong>{counts.active}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon amber"><i className="fas fa-envelope-open-text" /></span><div><small>Invited</small><strong>{counts.pending}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon gray"><i className="fas fa-user-slash" /></span><div><small>Inactive</small><strong>{counts.inactive}</strong></div></article>
    </section>}

    {!directoryView && !requestsView && !messagesView && <section className="owner-card owner-guide"><div><p className="owner-eyebrow">HOW IT WORKS</p><h2>Manage rented administrator access</h2><p>Invite an administrator after confirming payment. They receive a one-time setup link to create their password. You can then assign a role, activate or deactivate access, and send setup or password-reset links when needed.</p><a className="owner-button owner-button-primary" href="#admin-directory"><i className="fas fa-users-gear" /> Open Admin accounts</a></div><div className="owner-guide-steps"><article><span>01</span><div><strong>Invite</strong><small>Add the administrator’s name, email, and access role.</small></div></article><article><span>02</span><div><strong>Manage access</strong><small>Change roles or switch account access on and off.</small></div></article><article><span>03</span><div><strong>Review activity</strong><small>See recent security actions and send password links.</small></div></article></div></section>}

    {requestsView && <section className="owner-card owner-requests" id="support-requests"><header className="owner-requests-heading"><div><p className="owner-eyebrow">ADMIN HELP INBOX</p><h2>Open support requests</h2><p>Requests from administrators who need help signing in or recovering account access.</p></div><span className="owner-audit-count">{inboxCounts.requests} open</span></header>{supportRequests.length ? <div className="owner-request-table-scroll"><table className="owner-request-table"><thead><tr><th>Administrator</th><th>Request</th><th>Message</th><th>Date / time</th><th>Action</th></tr></thead><tbody>{supportRequests.map(request => <tr key={request.id}><td><strong>{request.name}</strong><a href={`mailto:${request.email}`}>{request.email}</a></td><td>{request.category.replaceAll('_', ' ')}</td><td className="owner-request-message">{request.message}</td><td><time>{formatActivityTime(request.createdAt)}</time></td><td><button className="owner-action-button" type="button" disabled={updatingRequestId === request.id} onClick={() => updateSupportRequest(request, 'resolved')}>{updatingRequestId === request.id ? 'Saving…' : 'Mark resolved'}</button></td></tr>)}</tbody></table></div> : <p className="owner-audit-empty">There are no open requests right now.</p>}</section>}

    {messagesView && <div id="owner-messages" className="owner-messages-view"><OwnerMessages onMessagesChanged={refreshInbox} /></div>}

    {directoryView && <>
    <section className="owner-stat-grid owner-directory-stats" aria-label="Admin account totals">
      <article className="owner-stat"><span className="owner-stat-icon blue"><i className="fas fa-users" /></span><div><small>All admins</small><strong>{counts.total}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon green"><i className="fas fa-circle-check" /></span><div><small>Active</small><strong>{counts.active}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon amber"><i className="fas fa-envelope-open-text" /></span><div><small>Invited</small><strong>{counts.pending}</strong></div></article>
      <article className="owner-stat"><span className="owner-stat-icon gray"><i className="fas fa-user-slash" /></span><div><small>Inactive</small><strong>{counts.inactive}</strong></div></article>
    </section>

    <section className="owner-card owner-directory" id="admin-directory"><div className="owner-section-heading"><div><p className="owner-eyebrow">ACCOUNT ACCESS</p><h2>Administrators</h2></div><span>{counts.total} accounts</span></div>
      <div className="owner-bulk-actions" aria-label="Bulk administrator actions">
        <span>Bulk actions <small>Customer admins only</small></span>
        <button type="button" className="bulk-activate" disabled={busy || bulkBusy || !counts.total} onClick={() => { setBulkPhrase(''); setBulkAction('activate_all'); }}><i className="fas fa-user-check" /> Activate all</button>
        <button type="button" className="bulk-deactivate" disabled={busy || bulkBusy || !counts.total} onClick={() => { setBulkPhrase(''); setBulkAction('deactivate_all'); }}><i className="fas fa-user-slash" /> Deactivate all</button>
        <button type="button" className="bulk-reset" disabled={busy || bulkBusy || !counts.total} onClick={() => { setBulkPhrase(''); setBulkAction('reset_passwords'); }}><i className="fas fa-key" /> Reset passwords all</button>
        <button type="button" className="bulk-assign-roles" disabled={busy || bulkBusy || !counts.total} onClick={() => { setBulkPhrase(''); setBulkRoles(['portfolio_owner']); setBulkAction('assign_roles_all'); }}><i className="fas fa-user-tag" /> Assign roles all</button>
        <button type="button" className="bulk-delete" disabled={busy || bulkBusy || !counts.total} onClick={() => { setBulkPhrase(''); setBulkAction('delete_all'); }}><i className="fas fa-trash-can" /> Delete all</button>
      </div>
      {bulkAction && <div className="owner-confirm-backdrop" role="presentation"><form className="owner-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="owner-bulk-title" onSubmit={event => { event.preventDefault(); runBulkAction(); }}>
        <span className={`owner-confirm-icon ${bulkAction === 'delete_all' ? 'danger' : ''}`}><i className={`fas ${bulkAction === 'delete_all' ? 'fa-triangle-exclamation' : bulkAction === 'reset_passwords' ? 'fa-key' : 'fa-users-gear'}`} aria-hidden="true" /></span>
        <h3 id="owner-bulk-title">{bulkActionInfo[bulkAction].title}</h3>
        <p>{bulkActionInfo[bulkAction].detail}</p>
        {bulkAction === 'assign_roles_all' && <fieldset className="owner-role-checks owner-bulk-role-checks" aria-label="Roles to assign to all customer admins"><legend>Roles to assign</legend>{roles.map(([value, label]) => <label key={value}><input type="checkbox" checked={bulkRoles.includes(value)} disabled={bulkBusy} onChange={event => setBulkRoles(current => event.target.checked ? [...current, value] : current.filter(role => role !== value))} /> <span>{label}</span></label>)}<small>Choose one or more roles. Every customer admin will receive exactly these roles.</small></fieldset>}
        {bulkAction !== 'assign_roles_all' && <><label htmlFor="owner-bulk-confirm">Type <strong>{bulkActionInfo[bulkAction].phrase}</strong> to confirm</label>
        <input id="owner-bulk-confirm" autoFocus autoComplete="off" value={bulkPhrase} onChange={event => setBulkPhrase(event.target.value)} /></>}
        <div className="owner-confirm-actions"><button type="button" className="owner-confirm-cancel" disabled={bulkBusy} onClick={() => { setBulkAction(''); setBulkPhrase(''); }}>Cancel</button><button type="submit" className={bulkAction === 'delete_all' ? 'owner-confirm-delete' : 'owner-confirm-submit'} disabled={bulkBusy || (bulkAction !== 'assign_roles_all' && bulkPhrase !== bulkActionInfo[bulkAction].phrase) || (bulkAction === 'assign_roles_all' && !bulkRoles.length)}>{bulkBusy ? 'Working…' : 'Confirm'}</button></div>
      </form></div>}
      <div className="owner-filters"><label className="owner-search"><i className="fas fa-magnifying-glass" /><input type="search" placeholder="Search by name or email" value={searchInput} onChange={event => setSearchInput(event.target.value)} /></label><label className="owner-status-filter"><span>Status</span><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All accounts</option><option value="active">Active</option><option value="pending">Invited</option><option value="inactive">Inactive</option></select></label></div>
      <div className="owner-table-wrap"><div className="owner-table-scroll"><table className="owner-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th className="owner-actions-heading">Actions</th></tr></thead><tbody>{admins.map(admin => <tr key={admin.id}>
        <td className="owner-name-cell"><strong>{admin.displayName}</strong></td>
        <td className="owner-email-cell">{admin.email}</td>
        <td className="owner-phone-cell">{admin.phone || <span>Not provided</span>}</td>
        <td><div className="owner-role-cell">{editingRolesId === admin.id ? <details className="owner-role-dropdown" open><summary>Choose roles <i className="fas fa-chevron-down" aria-hidden="true" /></summary><div className="owner-role-dropdown-panel"><fieldset className="owner-role-checks owner-row-role-checks" aria-label={`Access roles for ${admin.displayName}`}>{roles.map(([value, label]) => <label key={value}><input type="checkbox" checked={draftRoles.includes(value)} disabled={busy} onChange={event => setDraftRoles(current => event.target.checked ? [...current, value] : current.filter(role => role !== value))} /> <span>{label}</span></label>)}</fieldset><div className="owner-role-edit-actions"><button type="button" className="owner-role-save" disabled={busy || !draftRoles.length} onClick={() => updateAdmin(admin.id, 'roles', { roles: draftRoles }, 'Roles updated.')}>Confirm</button><button type="button" className="owner-role-cancel" disabled={busy} onClick={() => setEditingRolesId(null)}>Cancel</button></div></div></details> : <><div className="owner-role-badges">{(admin.roles || [admin.role]).map(value => <span className={value === 'platform_owner' ? 'is-super-admin' : ''} key={value}>{roles.find(([role]) => role === value)?.[1] || value}</span>)}</div><button type="button" className="owner-role-edit" disabled={busy} onClick={() => { setDraftRoles(admin.roles || [admin.role]); setEditingRolesId(admin.id); }} title="Edit access roles" aria-label={`Edit access roles for ${admin.displayName}`}><i className="fas fa-pen" /></button></>}</div></td>
        <td className={`owner-status-column ${admin.status === 'active' ? 'is-active' : admin.status === 'inactive' ? 'is-inactive' : 'is-pending'}`}><div className="owner-status-cell">{admin.role === 'platform_owner' ? <span className="owner-protected-status">Protected</span> : admin.status === 'pending' ? <span className="owner-status-pill pending">Invitation pending</span> : <><button type="button" role="switch" aria-checked={admin.status === 'active'} aria-label={`${admin.status === 'active' ? 'Deactivate' : 'Activate'} ${admin.displayName}`} className={`owner-status-toggle ${admin.status === 'active' ? 'is-on' : 'is-off'}`} disabled={busy} onClick={() => { const nextStatus = admin.status === 'active' ? 'inactive' : 'active'; updateAdmin(admin.id, 'status', { status: nextStatus }, nextStatus === 'active' ? 'Account activated.' : 'Account deactivated.'); }}><span className="owner-status-toggle-knob" /></button><span className={`owner-status-label ${admin.status}`}>{admin.status === 'active' ? 'Active' : 'Inactive'}</span></>}</div></td>
        <td><div className="owner-row-actions"><button type="button" className="owner-action-button owner-link-action" aria-label={admin.status === 'pending' ? `Resend setup link to ${admin.displayName}` : `Send password reset link to ${admin.displayName}`} disabled={busy || admin.role === 'platform_owner' || admin.status === 'inactive'} title={admin.status === 'inactive' ? 'Activate this account before sending a link' : undefined} onClick={() => updateAdmin(admin.id, 'password-reset', null, admin.status === 'pending' ? 'Setup link sent.' : 'Password reset link sent.')}>{admin.status === 'pending' && <i className="fas fa-paper-plane" aria-hidden="true" />} {admin.status === 'pending' ? 'Resend setup' : 'Reset password'}</button><button type="button" className="owner-action-button delete owner-icon-action" aria-label={`Delete administrator ${admin.displayName}`} title="Delete administrator" disabled={busy || admin.role === 'platform_owner'} onClick={() => { if (window.confirm(`Permanently delete ${admin.displayName} (${admin.email})? This removes their admin login, not portfolio content.`)) updateAdmin(admin.id, 'delete', null, 'Administrator account deleted.'); }}><i className="fas fa-trash-can" aria-hidden="true" /></button></div></td>
      </tr>)}</tbody></table>{admins.length === 0 && <div className="owner-empty"><i className="fas fa-user-magnifying-glass" /><strong>No administrators found</strong><span>Try another search or status filter.</span></div>}</div></div>
      <footer className="owner-pagination"><span>Page {page} of {totalPages}</span><div><button disabled={page <= 1 || busy} onClick={() => setPage(value => Math.max(1, value - 1))}><i className="fas fa-chevron-left" /> Previous</button><button disabled={page >= totalPages || busy} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Next <i className="fas fa-chevron-right" /></button></div></footer>
    </section>

    <section className="owner-card owner-audit" id="recent-activity" aria-labelledby="owner-audit-title">
      <header className="owner-audit-heading"><div><p className="owner-eyebrow">SECURITY HISTORY</p><h2 id="owner-audit-title">Recent access activity</h2><p>Review administrator actions and remove individual records when needed.</p></div><span className="owner-audit-count">{auditEvents.length} records</span></header>
      <div className="owner-audit-body">
        <form className="owner-audit-search" onSubmit={event => { event.preventDefault(); setActivitySearch(activitySearchInput.trim().toLowerCase()); }}>
          <label><i className="fas fa-magnifying-glass" /><input type="search" value={activitySearchInput} onChange={event => { setActivitySearchInput(event.target.value); setActivitySearch(event.target.value.trim().toLowerCase()); }} placeholder="Search activity, admin, or email" aria-label="Search access activity" /></label>
          <button type="submit">Search</button>
          <button className="owner-audit-delete-all owner-audit-icon-button" type="button" aria-label="Delete all activity records" title="Delete all activity records" disabled={!auditEvents.length || deletingAllAudit || deletingAuditId !== null} onClick={deleteAllAudit}><i className={`fas ${deletingAllAudit ? 'fa-spinner fa-spin' : 'fa-trash-can'}`} /></button>
        </form>
        {auditEvents.length ? visibleAuditEvents.length ? <>
          <p className="owner-audit-scroll-hint"><i className="fas fa-arrows-left-right" /> On smaller screens, scroll horizontally to see all columns.</p>
          <div className="owner-audit-table-scroll" role="region" aria-label="Recent access activity table" tabIndex="0">
            <table className="owner-audit-table"><thead><tr><th>Activity</th><th>Date / time</th><th>Action</th></tr></thead>
              <tbody>{visibleAuditEvents.map(event => <tr key={event.id}>
                <td><div className="owner-audit-activity"><span className="owner-audit-dot" /><div><strong>{formatActivityName(event.action)}</strong><small>{event.actorEmail || 'System'}{event.targetEmail ? ` · ${event.targetEmail}` : ''}</small></div></div></td>
                <td><time dateTime={event.createdAt}>{formatActivityTime(event.createdAt)}</time></td>
                <td><button type="button" className="owner-audit-delete" aria-label={`Delete ${formatActivityName(event.action)} activity`} title="Delete activity" disabled={deletingAllAudit || deletingAuditId !== null} onClick={() => deleteAuditEvent(event)}><i className={`fas ${deletingAuditId === event.id ? 'fa-spinner fa-spin' : 'fa-trash-can'}`} aria-hidden="true" /></button></td>
              </tr>)}</tbody>
            </table>
          </div>
        </> : <p className="owner-audit-empty">No activity matches your search.</p> : <p className="owner-audit-empty">No access changes recorded yet.</p>}
      </div>
    </section>
    </>}
    <p className="owner-data-note"><i className="fas fa-circle-info" /> Roles currently apply to this shared portfolio. Per-customer data separation is part of the next multi-tenant phase.</p>
    </div>
  </main>;
}
