import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Legal.module.scss';

const Privacy: React.FC = () => {
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
          <div className={styles.logo}>TILSF</div>
          <h1>Privacy Policy</h1>
          <p>
            <strong>Last updated:</strong> August 24, 2025
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, sign up for our newsletter, or contact us for
            support.
          </p>

          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, communicate with you, and develop new features.
          </p>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties without your consent, except as
            described in this policy.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@tilsf.com
          </p>

          <Link to="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
