import React, { useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { useLanguage } from '../context/LanguageContext.jsx';

const countries = getCountries().map((code) => ({
  code,
  dial: getCountryCallingCode(code)
}));
const countryCodes = new Set(countries.map(({ code }) => code));

export function parseInternationalPhone(value) {
  if (typeof value !== 'string' || !value.startsWith('+')) return undefined;
  const parsed = parsePhoneNumberFromString(value);
  return parsed?.isValid() ? parsed : undefined;
}

// Kept as an alias for callers that used the original helper name.
export const parseEastAfricanPhone = parseInternationalPhone;
export const isValidInternationalPhone = (value) => Boolean(parseInternationalPhone(value));
export const isValidEastAfricanPhone = isValidInternationalPhone;

function nationalPart(value, country) {
  if (!value) return '';
  const parsed = parsePhoneNumberFromString(value);
  if (parsed?.country === country) return parsed.nationalNumber;
  const dial = countries.find((item) => item.code === country)?.dial || '';
  return value.replace(new RegExp(`^\\+?${dial}`), '').replace(/[^0-9]/g, '');
}

export default function PhoneNumberField({ id, name = 'phone', value, onChange, required = false, disabled = false, describedBy, hidden = false }) {
  const { t, language } = useLanguage();
  const displayNames = useMemo(() => new Intl.DisplayNames([language], { type: 'region' }), [language]);
  const sortedCountries = useMemo(() => countries.map((item) => ({
    ...item,
    name: displayNames.of(item.code) || item.code
  })).sort((a, b) => a.name.localeCompare(b.name, language)), [displayNames, language]);
  const initialCountry = useMemo(() => {
    const parsed = parsePhoneNumberFromString(value || '');
    return countryCodes.has(parsed?.country) ? parsed.country : 'RW';
  }, []);
  const [country, setCountry] = useState(initialCountry);
  const selected = countries.find((item) => item.code === country) || countries.find((item) => item.code === 'RW');
  const nationalNumber = nationalPart(value || '', country);
  if (hidden) return null;
  return <div className="phone-number-field">
    <label className="sr-only" htmlFor={`${id}-country`}>{t('Select country')}</label>
    <select id={`${id}-country`} className="phone-country-select" aria-label={t('Select country')} value={country} disabled={disabled} onChange={(event) => {
      const nextCountry = event.target.value;
      const digits = nationalPart(value || '', country);
      const dial = countries.find((item) => item.code === nextCountry)?.dial;
      setCountry(nextCountry);
      onChange(digits ? `+${dial}${digits}` : '');
    }}>
      {sortedCountries.map((item) => <option key={item.code} value={item.code}>{item.name} (+{item.dial})</option>)}
    </select>
    <span className="phone-dial-code" aria-hidden="true">+{selected.dial}</span>
    <input id={id} name={name} type="tel" inputMode="tel" autoComplete="tel-national" maxLength="24" placeholder={t('Enter phone number')} aria-label={t('Phone number')} aria-describedby={describedBy} required={required} disabled={disabled} value={nationalNumber} onChange={(event) => {
      const digits = event.target.value.replace(/[^\d]/g, '');
      const parsed = digits ? parsePhoneNumberFromString(digits, country) : undefined;
      onChange(digits ? (parsed?.country === country ? parsed.number : `+${selected.dial}${digits}`) : '');
    }} />
  </div>;
}
