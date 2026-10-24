import React from 'react';

export default function LogoutIcon({ className = '' }) {
  return (
    <span className={`logout-action-icon${className ? ` ${className}` : ''}`} aria-hidden="true">
      <i className="fas fa-arrow-right-from-bracket" />
    </span>
  );
}
