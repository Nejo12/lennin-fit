import React from 'react';
import s from './SocialProof.module.scss';

export const SocialProof: React.FC = () => (
  <section className={s.proof} aria-label="Trusted by">
    <p>Designed for freelancers, coaches, and solo builders.</p>
    <div className={s.row}>
      <span className={s.badge}>Less stress</span>
      <span className={s.badge}>More focus</span>
      <span className={s.badge}>Fewer tools</span>
    </div>
  </section>
);
