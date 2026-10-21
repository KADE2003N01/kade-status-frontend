import React, { useMemo, useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useLanguage } from '../context/LanguageContext.jsx';

// East African Community calling codes. This is only a phone-number input
// preference; it does not restrict who can visit the website.
export const EAST_AFRICAN_COUNTRIES = [
  { code: 'BI', dial: '257', name: 'Burundi', sample: '79 12 34 56' },
  { code: 'CD', dial: '243', name: 'DR Congo', sample: '812 345 678' },
  { code: 'KE', dial: '254', name: 'Kenya', sample: '712 345 678' },
  { code: 'RW', dial: '250', name: 'Rwanda', sample: '788 950 833' },
  { code: 'SO', dial: '252', name: 'Somalia', sample: '7 123 4567' },
  { code: 'SS', dial: '211', name: 'South Sudan', sample: '977 123 456' },
  { code: 'TZ', dial: '255', name: 'Tanzania', sample: '712 345 678' },
  { code: 'UG', dial: '256', name: 'Uganda', sample: '712 345 678' }
];
const countryCodes = new Set(EAST_AFRICAN_COUNTRIES.map(({ code }) => code));

export function parseEastAfricanPhone(value) {
  if (typeof value !== 'string') return undefined;
  const parsed = parsePhoneNumberFromString(value);
  return parsed?.isValid() && countryCodes.has(parsed.country) ? parsed : undefined;
}

export function isValidEastAfricanPhone(value) {
  return Boolean(parseEastAfricanPhone(value));
}

function nationalPart(value, country) {
  if (!value) return '';
  const parsed = parsePhoneNumberFromString(value);
  if (parsed?.country === country) return parsed.nationalNumber;
  const dial = EAST_AFRICAN_COUNTRIES.find((item) => item.code === country)?.dial || '';
  return value.replace(new RegExp(`^\\+?${dial}`), '').replace(/\D/g, '');
}

export default function PhoneNumberField({ id, name = 'phone', value, onChange, required = false, disabled = false, describedBy, hidden = false }) {
  const { t } = useLanguage();
  const initialCountry = useMemo(() => {
    const parsed = parsePhoneNumberFromString(value || '');
    return countryCodes.has(parsed?.country) ? parsed.country : 'RW';
  }, []);
  const [country, setCountry] = useState(initialCountry);
  const selected = EAST_AFRICAN_COUNTRIES.find((item) => item.code === country) || EAST_AFRICAN_COUNTRIES[3];
  const nationalNumber = nationalPart(value || '', country);
  if (hidden) return null;
  return <div className="phone-number-field">
    <label className="sr-only" htmlFor={`${id}-country`}>{t('Select country')}</label>
    <select id={`${id}-country`} className="phone-country-select" aria-label={t('Select country')} value={country} disabled={disabled} onChange={(event) => {
      const nextCountry = event.target.value;
      const digits = nationalPart(value || '', country);
      const dial = EAST_AFRICAN_COUNTRIES.find((item) => item.code === nextCountry)?.dial;
      setCountry(nextCountry);
      onChange(digits ? `+${dial}${digits}` : '');
    }}>
      {EAST_AFRICAN_COUNTRIES.map((item) => <option key={item.code} value={item.code}>{t(item.name)} (+{item.dial})</option>)}
    </select>
    <span className="phone-dial-code" aria-hidden="true">+{selected.dial}</span>
    <input id={id} name={name} type="tel" inputMode="tel" autoComplete="tel-national" maxLength="24" placeholder={selected.sample} aria-label={t('Phone number')} aria-describedby={describedBy} required={required} disabled={disabled} value={nationalNumber} onChange={(event) => {
      const digits = event.target.value.replace(/[^\d]/g, '');
      onChange(digits ? `+${selected.dial}${digits}` : '');
    }} />
  </div>;
}
