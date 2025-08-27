import React from 'react';
import { Link } from 'react-router-dom';
import s from './CTA.module.scss';

export const CTA: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Submit to Netlify Forms
    const formDataObj = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formDataObj).toString(),
    })
      .then(() => {
        // Redirect to success page
        window.location.href = '/success';
      })
      .catch(() => {
        // Fallback redirect
        window.location.href = '/success';
      });
  };

  return (
    <section id="start" className={s.cta}>
      <h2>No stress. Fit your work and money together.</h2>
      <p>Join the early access list and get the Pro launch discount.</p>
      <form
        className={s.form}
        name="early-access"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="early-access" />
        <input type="hidden" name="bot-field" />
        <label htmlFor="email" className={s.srOnly}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@studio.com"
          required
          aria-describedby="email-help"
        />
        <button type="submit">Get Early Access</button>
      </form>
      <small id="email-help">
        We only email about product updates. No spam.
      </small>
      <div className={s.loginLink}>
        <Link to="/login">Already have an account? Sign in</Link>
      </div>
      <div className={s.tryLenninLink}>
        <a
          href="https://lennin.fit?utm_source=tilsf&utm_medium=website&utm_campaign=cta_section"
          className={s.tryLenninButton}
        >
          Try Lennin Free
        </a>
      </div>
    </section>
  );
};
