import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import { getStoredSessionToken } from '../../services/adminSession.js';

async function messageRequest(path, options = {}) {
  const token = getStoredSessionToken();
  const response = await apiFetch(`/messages${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Could not complete the message action.');
  return result;
}

export default function OwnerMessages({ onMessagesChanged }) {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeAdminId, setActiveAdminId] = useState('');
  const [recipientMode, setRecipientMode] = useState('selected');
  const [body, setBody] = useState('');
  const [broadcastReplies, setBroadcastReplies] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingReplyAccess, setUpdatingReplyAccess] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadMessages = useCallback(async () => {
    const result = await messageRequest('');
    const nextThreads = result.threads || [];
    setThreads(nextThreads);
    setMessages(result.messages || []);
    setActiveAdminId((current) => nextThreads.some((thread) => String(thread.adminId) === String(current))
      ? String(current)
      : String(nextThreads.find((thread) => thread.adminStatus === 'active')?.adminId || nextThreads[0]?.adminId || ''));
  }, []);

  useEffect(() => {
    let active = true;
    loadMessages().catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadMessages]);

  const activeAdmin = threads.find((thread) => String(thread.adminId) === String(activeAdminId));
  const activeMessages = activeAdmin?.id ? messages.filter((message) => message.threadId === activeAdmin.id) : [];

  async function setReplyAccess(allowed) {
    if (!activeAdmin) return;
    setError(''); setNotice('');
    const threadId = activeAdmin.id;
    setThreads((current) => current.map((thread) => thread.adminId === activeAdmin.adminId ? { ...thread, replyAllowed: allowed } : thread));
    if (!threadId) return;
    setUpdatingReplyAccess(true);
    try {
      await messageRequest(`/threads/${threadId}/replies`, { method: 'PATCH', body: JSON.stringify({ allowed }) });
      setNotice(allowed ? 'Replies enabled for this admin.' : 'Replies disabled for this admin.');
    } catch (requestError) {
      setThreads((current) => current.map((thread) => thread.adminId === activeAdmin.adminId ? { ...thread, replyAllowed: !allowed } : thread));
      setError(requestError.message);
    } finally { setUpdatingReplyAccess(false); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!body.trim() || sending || (recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active')) return;
    setSending(true); setError(''); setNotice('');
    try {
      const payload = {
        body: body.trim(),
        allowReplies: recipientMode === 'all' ? broadcastReplies : (activeAdmin?.replyAllowed ?? true),
        ...(recipientMode === 'all' ? { all: true } : { adminId: activeAdmin?.adminId })
      };
      const result = await messageRequest('', { method: 'POST', body: JSON.stringify(payload) });
      setBody('');
      setNotice(result.message || 'Message sent.');
      await loadMessages();
      await onMessagesChanged?.();
    } catch (requestError) { setError(requestError.message); }
    finally { setSending(false); }
  }

  return <section className="owner-card owner-messages" aria-labelledby="owner-messages-title">
    <header className="owner-messages-heading"><div><p className="owner-eyebrow">ADMIN COMMUNICATIONS</p><h2 id="owner-messages-title">Messages</h2><p>Contact all active admins or manage a private conversation. Reply access is controlled per conversation.</p></div></header>
    {error && <p className="owner-message-feedback is-error" role="alert">{error}</p>}
    {notice && <p className="owner-message-feedback" role="status">{notice}</p>}
    <div className="owner-message-layout">
      <aside className="owner-message-admins" aria-label="Admin conversations">
        <h3>Admin conversations</h3>
        {loading ? <p>Loading admins…</p> : threads.length ? threads.map((thread) => <button type="button" key={thread.adminId} className={String(thread.adminId) === String(activeAdminId) ? 'is-active' : ''} onClick={() => { setActiveAdminId(String(thread.adminId)); setRecipientMode('selected'); setNotice(''); }}>
          <span className="owner-message-avatar">{thread.adminName?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span className="owner-message-admin-copy"><strong>{thread.adminName}</strong><small>{thread.adminEmail}</small></span><i className={`owner-message-status ${thread.adminStatus}`} title={thread.adminStatus} />
        </button>) : <p>No admin accounts are available.</p>}
      </aside>
      <div className="owner-message-workspace">
        <header className="owner-message-conversation-heading"><div><strong>{activeAdmin?.adminName || 'Choose an admin'}</strong><small>{activeAdmin?.adminEmail || 'Select an account to view its conversation'}</small></div>
          {activeAdmin && <label className="owner-reply-toggle"><input type="checkbox" checked={Boolean(activeAdmin.replyAllowed)} disabled={updatingReplyAccess || activeAdmin.adminStatus !== 'active'} onChange={(event) => setReplyAccess(event.target.checked)} /><span>Replies allowed</span></label>}
        </header>
        <div className="owner-message-history" aria-live="polite">
          {loading ? <p>Loading messages…</p> : activeMessages.length ? activeMessages.map((message) => <article key={message.id} className={message.senderRole === 'platform_owner' ? 'owner-sent' : 'admin-sent'}><small>{message.senderName || message.senderEmail} · {new Date(message.createdAt).toLocaleString()}</small><p>{message.body}</p></article>) : <p className="owner-message-empty">{activeAdmin ? 'No messages in this conversation yet.' : 'Choose an admin conversation to see its messages.'}</p>}
        </div>
        <form className="owner-message-compose" onSubmit={sendMessage}>
          <label className="owner-message-recipient">Send to<select value={recipientMode} onChange={(event) => setRecipientMode(event.target.value)}><option value="selected" disabled={!activeAdmin || activeAdmin.adminStatus !== 'active'}>{activeAdmin ? `${activeAdmin.adminName} (private)` : 'Choose an active admin'}</option><option value="all">All active admins</option></select></label>
          {recipientMode === 'all' && <label className="owner-reply-toggle"><input type="checkbox" checked={broadcastReplies} onChange={(event) => setBroadcastReplies(event.target.checked)} /><span>Allow replies to this message</span></label>}
          <label className="sr-only" htmlFor="owner-message-body">Write a message</label><textarea id="owner-message-body" rows="4" maxLength="3000" value={body} onChange={(event) => setBody(event.target.value)} placeholder={recipientMode === 'all' ? 'Write a message to all active admins…' : 'Write a private message…'} disabled={recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active'} required />
          <button type="submit" disabled={sending || !body.trim() || (recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active')}><i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} aria-hidden="true" /> {sending ? 'Sending…' : recipientMode === 'all' ? 'Send to all active admins' : 'Send message'}</button>
          {recipientMode === 'selected' && activeAdmin && activeAdmin.adminStatus !== 'active' && <small className="owner-message-inactive-note">This account cannot receive messages while it is {activeAdmin.adminStatus}.</small>}
        </form>
      </div>
    </div>
  </section>;
}
