import React, { useEffect } from 'react';

export default function TimedNotification({ message, onClose, tone = 'info' }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(onClose, 10_000);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={`viewer-notification ${tone}`} role="status" aria-live="polite">
      <i className={`fas ${tone === 'error' ? 'fa-circle-exclamation' : tone === 'success' ? 'fa-circle-check' : 'fa-circle-info'}`} aria-hidden="true" />
      <span>{message}</span>
      <button className="viewer-notification-close" type="button" aria-label="Dismiss notification" onClick={onClose}>×</button>
    </div>
  );
}
