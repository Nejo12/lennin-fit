import React from 'react';
import s from './Select.module.scss';

interface Option { value: string; label: string; disabled?: boolean; }
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; hint?: string; error?: string; options: Option[]; id?: string;
}

export default function Select({ label, hint, error, options, id, ...rest }: Props){
  const selectId = id || rest.name || `select-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={s.root}>
      {label && <label className={s.label} htmlFor={selectId}>{label}</label>}
      <select id={selectId} aria-invalid={!!error} className={s.select} {...rest}>
        {options.map(o => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
      </select>
      {error ? <div className={s.error}>{error}</div> : hint ? <div className={s.hint}>{hint}</div> : null}
    </div>
  );
}
