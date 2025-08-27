import React from 'react';
import s from './TextField.module.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

export default function TextField({ label, hint, error, id, ...rest }: Props){
  const inputId = id || rest.name || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <div className={s.root}>
      {label && <label className={s.label} htmlFor={inputId}>{label}</label>}
      <input 
        id={inputId} 
        aria-invalid={!!error} 
        aria-describedby={hint ? `${inputId}-hint` : undefined} 
        className={s.input} 
        {...rest}
      />
      {error ? <div className={s.error}>{error}</div> : hint ? <div id={`${inputId}-hint`} className={s.hint}>{hint}</div> : null}
    </div>
  );
}
