import React from 'react';
import s from './CTA.module.scss';

export const CTA: React.FC = () => (
  <section id="start" className={s.cta}>
    <h2>No stress. Fit your work and money together.</h2>
    <p>Join the early access list and get the Pro launch discount.</p>
    <form
      className={s.form}
      action="https://formspree.io/f/xbldoqyd" /* swap to your form endpoint or Netlify Forms */
      method="POST"
    >
      <input name="email" type="email" placeholder="you@studio.com" required />
      <button type="submit">Get Early Access</button>
    </form>
    <small>We only email about product updates. No spam.</small>
  </section>
);
