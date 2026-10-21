import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, languageNames, t } = useLanguage();
  return <label className={`language-selector${compact ? ' compact' : ''}`}>
    <span className={compact ? 'sr-only' : ''}>{t('Language')}</span>
    <select aria-label={t('Language')} value={language} onChange={(event) => setLanguage(event.target.value)}>
      {Object.entries(languageNames).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
    </select>
  </label>;
}
