import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './Login.module.scss';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className={styles.loginPage}>
      {/* Header */}
      <div className={styles.header}>
        <a href="/" className={styles.brand}>
          <span className={styles.logo}>L</span>
          <span className={styles.brandName}>TILSF</span>
        </a>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          {/* Card */}
          <div className={styles.card}>
            {/* Header */}
            <div className={styles.headerSection}>
              <div className={styles.logoContainer}>
                <span className={styles.logo}>L</span>
              </div>
              <h1 className={styles.title}>Welcome back</h1>
              <p className={styles.subtitle}>Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={send} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className={styles.input}
                />
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <div className={styles.errorContent}>
                    <svg
                      className={styles.icon}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <button type="submit" className={styles.submitButton}>
                Send magic link
              </button>

              {sent && (
                <div className={styles.successMessage}>
                  <div className={styles.successContent}>
                    <svg
                      className={styles.icon}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Check your inbox for the magic link
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className={styles.footer}>
              <p className={styles.footerText}>
                Don't have an account?{' '}
                <a href="/" className={styles.signupLink}>
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
