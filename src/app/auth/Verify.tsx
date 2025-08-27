import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './Verify.module.scss';

export default function Verify() {
  const [status, setStatus] = useState('Verifying…');
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const hash = window.location.hash;
      if (!hash.includes('access_token')) {
        setStatus('Invalid link. Please request a new one.');
        return;
      }

      try {
        setStatus('Setting up your session...');

        // Wait for Supabase to process the session
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setStatus('Redirecting to dashboard...');
          // Give a moment for the session to be properly set
          setTimeout(() => nav('/app', { replace: true }), 500);
        } else {
          setStatus('Session not found. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('Error verifying your account. Please try again.');
      }
    })();
  }, [nav]);

  return (
    <div className={styles.verifyPage}>
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
          <div className={styles.card}>
            <div className={styles.logoContainer}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className={styles.title}>Verifying your account</h1>
            <p className={styles.status}>{status}</p>
            {status === 'Verifying…' && (
              <div className={styles.spinner}>
                <div className={styles.spinnerIcon}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
