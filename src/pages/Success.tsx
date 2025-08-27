import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Success.module.scss';

const Success: React.FC = () => {
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
          <div className={styles.brandLogo}>TILSF</div>
          <h1>You're on the list! 🎉</h1>
          <p>
            Thanks for joining our early access list. We'll email you as soon as
            we launch the full app with clients, tasks, and invoices all in one
            place.
          </p>
          <Link to="/" className={styles.btn}>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Success;
