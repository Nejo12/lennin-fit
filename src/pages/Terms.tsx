import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Legal.module.scss';

const Terms: React.FC = () => {
  return (
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
          <div className={styles.logo}>Lennin.fit</div>
          <h1>Terms of Service</h1>
          <p>
            <strong>Last updated:</strong> August 24, 2025
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using Lennin.fit, you accept and agree to be bound
            by the terms and provision of this agreement.
          </p>

          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily use Lennin.fit for personal,
            non-commercial transitory viewing only. This is the grant of a
            license, not a transfer of title.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The materials on Lennin.fit are provided on an 'as is' basis.
            Lennin.fit makes no warranties, expressed or implied, and hereby
            disclaims and negates all other warranties including without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>

          <h2>Limitations</h2>
          <p>
            In no event shall Lennin.fit or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use the materials on Lennin.fit.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please
            contact us at legal@lennin.fit
          </p>

          <Link to="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Terms;
