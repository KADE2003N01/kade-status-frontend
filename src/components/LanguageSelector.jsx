import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSelector({ compact = false, className = '' }) {
  const { language, setLanguage, languageNames, t } = useLanguage();
  const selectorRef = useRef(null);
  const availableLanguages = Object.entries(languageNames).filter(([code]) => code !== language);
  return <label className={`language-selector${compact ? ' compact' : ''}${className ? ` ${className}` : ''}`}>
    <span className={compact ? 'sr-only' : ''}>{t('Language')}</span>
    <details className="language-picker" ref={selectorRef}>
      <summary aria-label={`${t('Language')}: ${language.toUpperCase()}`} title={t('Language')}>
        {language.toUpperCase()} <i className="fas fa-chevron-down" aria-hidden="true" />
      </summary>
      <div className="language-picker-menu" role="group" aria-label={t('Change language')}>
        {availableLanguages.map(([code, label]) => <button key={code} type="button" onClick={() => {
          setLanguage(code);
          if (selectorRef.current) selectorRef.current.open = false;
        }} aria-label={`${t('Change language to')} ${label}`}>
          {code.toUpperCase()}
        </button>)}
      </div>
    </details>
  </label>;
}
