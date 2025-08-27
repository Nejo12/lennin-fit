import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import styles from './Legal.module.scss';

const Terms: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Terms of Service for TILSF and Lennin.fit - Read our terms and conditions."
        canonical="https://lennin.fit/terms"
      />
      <div className={styles.page}>
        <header className={styles.header}>
          <Link to="/" className={styles.brand}>
            <span className={styles.logo}>L</span>
            <span className={styles.word}>Lennin</span>
            <span className={styles.dot}>.fit</span>
          </Link>
        </header>

        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.logo}>TILSF</div>
            <h1>Terms of Service</h1>
            <p>
              <strong>Last updated:</strong> August 24, 2025
            </p>

            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using TILSF, you accept and agree to be bound by
              the terms and provision of this agreement.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily use TILSF for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title.
            </p>

            <h2>Disclaimer</h2>
            <p>
              The materials on TILSF are provided on an 'as is' basis. TILSF
              makes no warranties, expressed or implied, and hereby disclaims
              and negates all other warranties including without limitation,
              implied warranties or conditions of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property
              or other violation of rights.
            </p>

            <h2>Limitations</h2>
            <p>
              In no event shall TILSF or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or
              profit, or due to business interruption) arising out of the use or
              inability to use the materials on TILSF.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at legal@tilsf.com
            </p>

            <Link to="/" className={styles.backLink}>
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default Terms;
