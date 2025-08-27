import React, { useEffect } from 'react';
import s from './Modal.module.scss';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={s.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={s.panel}>
        <div className={s.header}>
          <div className={s.title}>{title}</div>
          <button className={s.close} aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
