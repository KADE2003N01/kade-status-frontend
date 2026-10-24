import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../services/api.js';
import { getStoredSessionToken } from '../../services/adminSession.js';
import { discardMessageAttachments, MessageAttachmentList, MessageAttachmentPicker, uploadMessageAttachment } from '../../components/MessageAttachments.jsx';

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
  const [recipientRole, setRecipientRole] = useState('');
  const [adminSearchInput, setAdminSearchInput] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [body, setBody] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [managingMessages, setManagingMessages] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [broadcastReplies, setBroadcastReplies] = useState(true);
  const [broadcastRepliesChanged, setBroadcastRepliesChanged] = useState(false);
  const [messageRepliesAllowed, setMessageRepliesAllowed] = useState(true);
  const [showMutedAdmins, setShowMutedAdmins] = useState(false);
  const [selectedReplyAdminIds, setSelectedReplyAdminIds] = useState([]);
  const [muteRole, setMuteRole] = useState('');
  const [replyAccessBusy, setReplyAccessBusy] = useState(false);
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

  // Keep conversations fresh: poll quietly while the page is visible and no
  // message is being sent, edited, or managed.
  useEffect(() => {
      const timer = window.setInterval(() => {
          if (document.hidden || sending || editingMessageId !== null || managingMessages) return;
          loadMessages().catch(() => {});
      }, 15000);
      return () => window.clearInterval(timer);
  }, [sending, editingMessageId, managingMessages, loadMessages]);

  useEffect(() => {
      const timer = window.setTimeout(() => setAdminSearch(adminSearchInput.trim().toLowerCase()), 200);
      return () => window.clearTimeout(timer);
  }, [adminSearchInput]);

  const historyRef = useRef(null);
  const composeRef = useRef(null);

  const activeAdmin = threads.find((thread) => String(thread.adminId) === String(activeAdminId));
  const mutedAdmins = threads.filter((thread) => thread.replyAllowed === false);
  const activeMessages = activeAdmin?.id ? messages.filter((message) => message.threadId === activeAdmin.id) : [];
  const searchedThreads = threads.filter((thread) =>
    `${thread.adminName || ''} ${thread.adminEmail || ''}`.toLowerCase().includes(adminSearch)
      && (roleFilter === 'all' || (thread.adminRoles || []).includes(roleFilter))
  );
  const visibleThreads = searchedThreads;
  // The backend returns oldest-first; flip so the newest message sits on top
  // and older messages scroll away below.
  const activeMessagesNewestFirst = [...activeMessages].reverse();
  const allRoleValues = [...new Set(threads.flatMap((thread) => thread.adminRoles || []))];
  const roleCounts = {};
  threads.forEach((thread) => (thread.adminRoles || []).forEach((role) => { roleCounts[role] = (roleCounts[role] || 0) + 1; }));

  // Group messages the owner sent at the same moment (a broadcast is stored once per thread)
  // so every sent bubble can show exactly which admins received it.
  const sentGroups = {};
  messages.forEach((message) => {
    if (message.senderRole !== 'platform_owner' || !message.messageGroupId) return;
    const key = message.messageGroupId;
    const thread = threads.find((item) => item.id === message.threadId);
    if (!thread) return;
    (sentGroups[key] ||= []).push({ name: thread.adminName || thread.adminEmail, roles: thread.adminRoles || [] });
  });

  // Keep the newest message (top of the list) in view.
  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollTop = 0;
  }, [activeAdminId, activeMessages.length]);

  useEffect(() => {
    if (editingMessageId !== null) composeRef.current?.focus();
  }, [editingMessageId]);

  const roleLabels = {
    platform_owner: 'Super admin',
    portfolio_owner: 'Portfolio owner',
    content_manager: 'Content manager',
    document_manager: 'Document manager',
    download_manager: 'Download manager',
    profile_manager: 'Profile manager'
  };
  const activeRecipients = recipientMode === 'all'
    ? threads.filter((thread) => thread.adminStatus === 'active').length
    : recipientMode === 'role'
      ? threads.filter((thread) => thread.adminStatus === 'active' && (thread.adminRoles || []).includes(recipientRole)).length
      : (activeAdmin?.adminStatus === 'active' ? 1 : 0);

  async function setReplyAccess(allowed) {
    if (!activeAdmin) return;
    setError(''); setNotice('');
    const threadId = activeAdmin.id;
    setThreads((current) => current.map((thread) => thread.adminId === activeAdmin.adminId ? { ...thread, replyAllowed: allowed } : thread));
    setUpdatingReplyAccess(true);
    try {
      await messageRequest(threadId ? `/threads/${threadId}/replies` : '/threads/replies/bulk', {
        method: 'PATCH', body: JSON.stringify(threadId ? { allowed } : { allowed, adminIds: [activeAdmin.adminId] })
      });
      if (!threadId) await loadMessages();
      setNotice(allowed ? `Replies enabled for ${activeAdmin.adminName}.` : `Replies stopped for ${activeAdmin.adminName}.`);
    } catch (requestError) {
      setThreads((current) => current.map((thread) => thread.adminId === activeAdmin.adminId ? { ...thread, replyAllowed: !allowed } : thread));
      setError(requestError.message);
    } finally { setUpdatingReplyAccess(false); }
  }

  async function setBulkReplyAccess({ adminIds, role, allowed }) {
    setError(''); setNotice(''); setReplyAccessBusy(true);
    try {
      const result = await messageRequest('/threads/replies/bulk', { method: 'PATCH', body: JSON.stringify({ ...(role ? { role } : { adminIds }), allowed }) });
      setSelectedReplyAdminIds([]);
      await loadMessages();
      setNotice(result.message || 'Reply access updated.');
    } catch (requestError) { setError(requestError.message); }
    finally { setReplyAccessBusy(false); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if ((!body.trim() && !pendingFiles.length) || sending || (!editingMessageId && recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active')) return;
    setSending(true); setError(''); setNotice('');
    const uploadedIds = [];
    try {
      if (editingMessageId !== null) {
        await messageRequest(`/${editingMessageId}`, { method: 'PATCH', body: JSON.stringify({ body: body.trim() }) });
        setBody('');
        setEditingMessageId(null);
        setNotice('Message updated.');
        await loadMessages();
        return;
      }
      const payload = {
        body: body.trim(),
        ...(recipientMode === 'selected' ? { allowReplies: activeAdmin?.replyAllowed ?? true } : broadcastRepliesChanged ? { allowReplies: broadcastReplies } : {}),
        allowMessageReplies: messageRepliesAllowed,
        ...(recipientMode === 'role' ? { recipientRole } : {}),
        ...(recipientMode === 'all'
          ? { all: true }
          : recipientMode === 'role'
            ? { adminIds: threads.filter((thread) => thread.adminStatus === 'active' && (thread.adminRoles || []).includes(recipientRole)).map((thread) => thread.adminId) }
            : { adminId: activeAdmin?.adminId })
      };
      for (const file of pendingFiles) uploadedIds.push((await uploadMessageAttachment(file)).id);
      const result = await messageRequest('', { method: 'POST', body: JSON.stringify({ ...payload, attachmentIds: uploadedIds }) });
      setBody('');
      setPendingFiles([]);
      setBroadcastRepliesChanged(false);
      setNotice(result.message || 'Message sent.');
      await loadMessages();
      await onMessagesChanged?.();
    } catch (requestError) {
      if (uploadedIds.length) {
        try { await discardMessageAttachments(uploadedIds); } catch { /* Preserve the original send error. */ }
      }
      setError(requestError.message);
    }
    finally { setSending(false); }
  }

  async function deleteMessage(messageId) {
    if (!window.confirm('Clear this message from the recipient conversations? You can clear it permanently later.')) return;
    setError(''); setNotice('');
    try {
      await messageRequest(`/${messageId}`, { method: 'DELETE' });
      await loadMessages();
      setNotice('Message cleared.');
    } catch (requestError) { setError(requestError.message); }
  }

  async function deleteSelectedMessages() {
    if (!activeSelectedMessageIds.length || !window.confirm(`Clear the selected ${activeSelectedMessageIds.length} sent message${activeSelectedMessageIds.length === 1 ? '' : 's'}?`)) return;
    setError(''); setNotice('');
    try {
      const result = await messageRequest('/bulk-clear', { method: 'DELETE', body: JSON.stringify({ ids: activeSelectedMessageIds }) });
      await loadMessages();
      setSelectedMessageIds([]); setManagingMessages(false);
      setNotice(result.message || 'Selected messages cleared.');
    } catch (requestError) { setError(requestError.message); }
  }

  async function clearMessagePermanently(messageId) {
    if (!window.confirm('Clear this message, its recipient copies, and attachments permanently? This cannot be undone.')) return;
    setError(''); setNotice('');
    try {
      await messageRequest(`/${messageId}/clear-permanent`, { method: 'DELETE' });
      await loadMessages();
      await onMessagesChanged?.();
      setNotice('Message cleared permanently.');
    } catch (requestError) { setError(requestError.message); }
  }

  async function clearSelectedPermanently() {
    if (!selectedMessageIds.length || !window.confirm(`Clear ${selectedMessageIds.length} selected message${selectedMessageIds.length === 1 ? '' : 's'}, their recipient copies, and attachments permanently? This cannot be undone.`)) return;
    setError(''); setNotice('');
    try {
      const result = await messageRequest('/bulk-clear-permanent', { method: 'DELETE', body: JSON.stringify({ ids: selectedMessageIds }) });
      await loadMessages();
      await onMessagesChanged?.();
      setSelectedMessageIds([]); setManagingMessages(false);
      setNotice(result.message || 'Selected messages cleared permanently.');
    } catch (requestError) { setError(requestError.message); }
  }

  const selectableMessages = activeMessages.filter((message) => message.senderRole === 'platform_owner');
  const activeSelectedMessageIds = selectedMessageIds.filter((id) => selectableMessages.some((message) => message.id === id && !message.deletedAt));
  const allSelectableSelected = selectableMessages.length > 0 && selectableMessages.every((message) => selectedMessageIds.includes(message.id));

  return <section className="owner-card owner-messages" aria-labelledby="owner-messages-title">
    <header className="owner-messages-heading"><div><p className="owner-eyebrow">ADMIN COMMUNICATIONS</p><h2 id="owner-messages-title">Chat</h2><p>Choose a role to message all active admins in it, or select one admin for a private conversation and set their reply access.</p></div></header>
    {error && <p className="owner-message-feedback is-error" role="alert">{error}</p>}
    {notice && <p className="owner-message-feedback" role="status">{notice}</p>}
    <div className="owner-message-layout">
      <aside className={`owner-message-admins${adminSearch || roleFilter !== 'all' ? ' is-filtered' : ''}`} aria-label="Admin conversations">
        <div className="owner-message-admin-tools">
          <label className="owner-message-search"><i className="fas fa-magnifying-glass" /><input type="search" placeholder="Find an admin by name or email" value={adminSearchInput} onChange={(event) => setAdminSearchInput(event.target.value)} aria-label="Search admin conversations" /></label>
          <label className="owner-message-role-filter"><span>Role</span><select value={roleFilter} onChange={(event) => { const role = event.target.value; setRoleFilter(role); setRecipientRole(role === 'all' ? '' : role); setRecipientMode(role === 'all' ? 'all' : 'role'); setNotice(''); }} aria-label="Filter admins and choose message recipients by role"><option value="all">All roles ({threads.length})</option>{allRoleValues.map((value) => <option key={value} value={value}>{roleLabels[value] || value} ({roleCounts[value] || 0})</option>)}</select></label>
          {(adminSearch || roleFilter !== 'all') && <button type="button" className="owner-message-filter-clear" onClick={() => { setAdminSearchInput(''); setRoleFilter('all'); setRecipientRole(''); setRecipientMode((mode) => mode === 'role' ? 'all' : mode); }}><i className="fas fa-xmark" /> Clear</button>}
        </div>
        <h3>{adminSearch || roleFilter !== 'all' ? 'Matching admins' : 'All admins'} <span>{adminSearch || roleFilter !== 'all' ? `${visibleThreads.length} of ${searchedThreads.length}` : `${visibleThreads.length} · scroll for more`}</span></h3>
        <div className="owner-message-admin-list">{loading ? <p className="owner-message-empty-state">Loading admins…</p> : visibleThreads.length ? visibleThreads.map((thread) => <button type="button" key={thread.adminId} className={`owner-message-admin${String(thread.adminId) === String(activeAdminId) ? ' is-active' : ''}`} onClick={() => { setActiveAdminId(String(thread.adminId)); setRecipientMode('selected'); setManagingMessages(false); setSelectedMessageIds([]); setNotice(''); }}>
          <span className="owner-message-avatar">{thread.adminName?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span className="owner-message-admin-copy"><strong>{thread.adminName}</strong><small>{(thread.adminRoles || []).map((value) => roleLabels[value] || value).join(', ') || thread.adminEmail}</small></span><i className={`owner-message-status ${thread.adminStatus}`} title={thread.adminStatus} />
        </button>) : <p className="owner-message-empty-state">{threads.length ? 'No admins match your search or role filter.' : 'No admin accounts are available.'}</p>}</div>
      </aside>
      <div className="owner-message-workspace">
        <header className="owner-message-conversation-heading"><div><strong>{recipientMode === 'all' ? `Broadcast · ${activeRecipients} active admin${activeRecipients === 1 ? '' : 's'}` : recipientMode === 'role' ? `${roleLabels[recipientRole] || recipientRole} · ${activeRecipients} active admin${activeRecipients === 1 ? '' : 's'}` : activeAdmin?.adminName || 'Choose an admin'}</strong><small>{recipientMode === 'all' ? 'One copy lands in every active admin conversation' : recipientMode === 'role' ? `Message all active ${roleLabels[recipientRole] || recipientRole} admins` : activeAdmin?.adminEmail || 'Search and select an account to open its conversation'}</small></div>
          <div className="owner-message-header-actions">
          {recipientMode === 'selected' && activeAdmin && <label className="owner-reply-toggle" title="Conversation-wide setting that applies to every reply"><input type="checkbox" checked={Boolean(activeAdmin.replyAllowed)} disabled={updatingReplyAccess || activeAdmin.adminStatus !== 'active'} onChange={(event) => setReplyAccess(event.target.checked)} /><span>{activeAdmin.replyAllowed ? 'All replies allowed' : 'All replies stopped'}</span></label>}
          <div className="owner-message-mute-menu">
            <button type="button" className="owner-muted-admins-toggle" aria-expanded={showMutedAdmins} aria-label={`Muted admins: ${mutedAdmins.length}`} title="Manage muted admins and role groups" onClick={() => setShowMutedAdmins((shown) => !shown)}><i className="fas fa-volume-xmark" /><span>{mutedAdmins.length}</span></button>
            {showMutedAdmins && <div className="owner-muted-admins-panel">
              <div className="owner-muted-admins-heading"><strong>Manage reply access</strong><button type="button" aria-label="Cancel and close reply access" title="Cancel" onClick={() => { setShowMutedAdmins(false); setSelectedReplyAdminIds([]); }}><i className="fas fa-xmark" /></button></div>
              <label className="owner-muted-role-select">Mute or allow by role<select value={muteRole} onChange={(event) => setMuteRole(event.target.value)}><option value="">Choose a role</option>{allRoleValues.map((role) => <option key={role} value={role}>{roleLabels[role] || role}</option>)}</select></label>
              <div className="owner-muted-admin-actions"><button type="button" disabled={!muteRole || replyAccessBusy} onClick={() => setBulkReplyAccess({ role: muteRole, allowed: false })}>Mute role</button><button type="button" disabled={!muteRole || replyAccessBusy} onClick={() => setBulkReplyAccess({ role: muteRole, allowed: true })}>Allow role</button></div>
              {threads.length ? <><div className="owner-muted-admin-list">{threads.map((thread) => <label key={thread.adminId}><input type="checkbox" checked={selectedReplyAdminIds.includes(thread.adminId)} onChange={(event) => setSelectedReplyAdminIds((current) => event.target.checked ? [...current, thread.adminId] : current.filter((id) => id !== thread.adminId))} /><span><strong>{thread.adminName}</strong><small>{(thread.adminRoles || []).map((role) => roleLabels[role] || role).join(', ') || thread.adminEmail}</small></span><em className={thread.replyAllowed ? '' : 'is-muted'}>{thread.replyAllowed ? 'Allowed' : 'Muted'}</em></label>)}</div><div className="owner-muted-admin-actions"><button type="button" disabled={!selectedReplyAdminIds.length || replyAccessBusy} onClick={() => setBulkReplyAccess({ adminIds: selectedReplyAdminIds, allowed: false })}>Mute selected</button><button type="button" disabled={!selectedReplyAdminIds.length || replyAccessBusy} onClick={() => setBulkReplyAccess({ adminIds: selectedReplyAdminIds, allowed: true })}>Allow selected</button></div></> : <p className="owner-message-empty-state">No admins are available.</p>}
            </div>}
          </div>
          <button type="button" className="owner-message-manage-toggle" disabled={!selectableMessages.length} onClick={() => { setManagingMessages((current) => !current); setSelectedMessageIds([]); }}>{managingMessages ? 'Cancel' : 'Manage'}</button>
          </div>
        </header>
        {managingMessages && <div className="owner-message-bulk-actions"><button type="button" className={!allSelectableSelected ? 'is-active' : ''} disabled={!selectableMessages.length} onClick={() => setSelectedMessageIds([])}>Select manually</button><button type="button" className={allSelectableSelected ? 'is-active' : ''} disabled={!selectableMessages.length} onClick={() => setSelectedMessageIds(selectableMessages.map((message) => message.id))}>Select all in conversation</button><span>{selectedMessageIds.length} selected</span><button type="button" disabled={!activeSelectedMessageIds.length} onClick={deleteSelectedMessages}>Clear</button><button type="button" className="owner-message-clear-permanent" disabled={!selectedMessageIds.length} onClick={clearSelectedPermanently}>Clear permanently</button></div>}
        <div className="owner-message-history" ref={historyRef} aria-live="polite">
          {loading ? <p className="owner-message-empty-state">Loading messages…</p> : activeMessages.length ? <>
            {activeMessagesNewestFirst.map((message) => {
            const recipients = message.senderRole === 'platform_owner' && message.messageGroupId ? (sentGroups[message.messageGroupId] || []) : null;
            const sentLabel = !recipients ? 'Sent' : message.messageGroupLabel === 'all'
              ? `Sent to ${recipients.length} admin${recipients.length === 1 ? '' : 's'}`
              : message.messageGroupLabel
                ? `Sent to ${message.messageGroupLabel} (${recipients.length})`
                : recipients.length === 1 ? `Sent to ${recipients[0].name}` : `Sent to ${recipients.length} admins`;
            return <article key={message.id} className={`owner-message-bubble ${message.senderRole === 'platform_owner' ? 'owner-sent' : 'admin-sent'}`}>
              <small>{message.senderName || message.senderEmail} · {new Date(message.createdAt).toLocaleString()}</small>
              {managingMessages && message.senderRole === 'platform_owner' && <label className="owner-message-select"><input type="checkbox" checked={selectedMessageIds.includes(message.id)} aria-label="Select sent message" onChange={(event) => setSelectedMessageIds((current) => event.target.checked ? [...current, message.id] : current.filter((id) => id !== message.id))} /></label>}
              {message.deletedAt ? <><p className="owner-message-deleted"><i className="fas fa-ban" /> This message was cleared</p>{message.senderRole === 'platform_owner' && <button type="button" className="owner-message-permanent-clear" title="Clear permanently" aria-label="Clear message permanently" onClick={() => clearMessagePermanently(message.id)}><i className="fas fa-trash-can" /></button>}</> : <><p>{message.body}</p><MessageAttachmentList attachments={message.attachments} />{message.editedAt && <small className="owner-message-edited-label">Edited</small>}{message.senderRole === 'platform_owner' && !managingMessages && <div className="owner-message-controls"><button type="button" aria-label="Edit sent message" title="Edit message" onClick={() => { setRecipientMode('selected'); setBody(message.body); setEditingMessageId(message.id); }}><i className="fas fa-pen" /></button><button type="button" aria-label="Clear message" title="Clear message" onClick={() => deleteMessage(message.id)}><i className="fas fa-trash" /></button></div>}</>}
              {message.senderRole === 'platform_owner' && <><span className="owner-message-delivered" title={recipients?.map((recipient) => recipient.name).join(', ')}><i className="fas fa-check-double" aria-hidden="true" /> {sentLabel}</span><span className={`owner-message-reply-status${message.replyAllowed === false || message.replyAllowed === 0 ? ' is-disabled' : ''}`} title="Reply permission saved with this message"><i className={`fas ${message.replyAllowed === false || message.replyAllowed === 0 ? 'fa-lock' : 'fa-reply'}`} aria-hidden="true" /> {message.replyAllowed === false || message.replyAllowed === 0 ? 'Replies not allowed' : 'Replies allowed'}</span></>}
            </article>;
            })}
            {activeMessages.length > 5 && <button type="button" className="owner-message-older-hint" onClick={() => { const history = historyRef.current; if (history) history.scrollTop = history.scrollHeight; }}><i className="fas fa-arrow-down" /> {activeMessages.length - 5} older below</button>}
          </> : <p className="owner-message-empty-state">{activeAdmin ? 'No messages in this conversation yet. Write the first one below.' : 'Choose an admin conversation to see its messages.'}</p>}
        </div>
        <form className="owner-message-compose" onSubmit={sendMessage}>
          <div className="owner-message-compose-row">
            <label className="owner-message-recipient">Send to<select value={recipientMode === 'role' ? `role:${recipientRole}` : recipientMode} onChange={(event) => { const value = event.target.value; if (value.startsWith('role:')) { const role = value.slice(5); setRecipientRole(role); setRoleFilter(role); setRecipientMode('role'); } else setRecipientMode(value); }}><option value="selected" disabled={!activeAdmin || activeAdmin.adminStatus !== 'active'}>{activeAdmin ? `${activeAdmin.adminName} (private)` : 'Choose an active admin'}</option><option value="all">All active admins ({threads.filter((thread) => thread.adminStatus === 'active').length})</option>{allRoleValues.map((role) => <option key={role} value={`role:${role}`}>All {roleLabels[role] || role} admins ({threads.filter((thread) => thread.adminStatus === 'active' && (thread.adminRoles || []).includes(role)).length})</option>)}</select></label>
          {recipientMode !== 'selected' && <label className="owner-reply-toggle" title="Change conversation-wide reply access for admins receiving this broadcast"><input type="checkbox" checked={broadcastReplies} onChange={(event) => { setBroadcastReplies(event.target.checked); setBroadcastRepliesChanged(true); }} /><span>{broadcastReplies ? 'All replies allowed' : 'All replies stopped'}</span></label>}
          <label className={`owner-reply-toggle owner-message-per-message-reply${messageRepliesAllowed ? '' : ' is-disabled'}`} title="This permission is stored on the message and checked by the server"><input type="checkbox" checked={messageRepliesAllowed} onChange={(event) => setMessageRepliesAllowed(event.target.checked)} /><span>{messageRepliesAllowed ? 'Replies to this message allowed' : 'No replies to this message'}</span></label>
          </div>
          <MessageAttachmentPicker files={pendingFiles} onFilesChange={setPendingFiles} disabled={sending || editingMessageId !== null || (recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active')} onError={setError} />
          <div className="owner-message-compose-input-row">
            <label className="sr-only" htmlFor="owner-message-body">{editingMessageId !== null ? 'Edit sent message' : 'Write a message'}</label><textarea ref={composeRef} id="owner-message-body" rows="2" maxLength="3000" value={body} onChange={(event) => setBody(event.target.value)} placeholder={recipientMode === 'all' ? 'Write a message to all active admins…' : recipientMode === 'role' ? `Write to active ${roleLabels[recipientRole] || recipientRole} admins…` : 'Write a private message…'} disabled={!editingMessageId && recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active'} required={!pendingFiles.length} />
            <div className="owner-message-compose-actions">
              {editingMessageId !== null && <small className="owner-message-editing-note">Editing sent message <button type="button" onClick={() => { setEditingMessageId(null); setBody(''); }}>Cancel</button></small>}
              {!editingMessageId && recipientMode === 'selected' && activeAdmin && activeAdmin.adminStatus !== 'active' && <small className="owner-message-inactive-note">This account cannot receive messages while it is {activeAdmin.adminStatus}.</small>}
              <button className="owner-message-send" type="submit" disabled={sending || (!body.trim() && !pendingFiles.length) || (!editingMessageId && recipientMode === 'selected' && activeAdmin?.adminStatus !== 'active') || (!editingMessageId && recipientMode !== 'selected' && !activeRecipients)}><i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} aria-hidden="true" /> {sending ? 'Sending…' : 'Send'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>;
}
