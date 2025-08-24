import React from 'react';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { Features } from './components/Features';
import { CTA } from './components/CTA';
import styles from './styles/App.module.scss';

const App: React.FC = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <span className={styles.logo}>L</span>
          <span className={styles.word}>Lennin</span>
          <span className={styles.dot}>.fit</span>
        </a>
        <nav className={styles.nav}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a className={styles.ctaHeader} href="#start">
            Start Free
          </a>
        </nav>
      </header>

      <main>
        <Hero />
        <SocialProof />
        <Features />
        <CTA />
      </main>

      <footer className={styles.footer}>
        <div>© {new Date().getFullYear()} Lennin</div>
        <div className={styles.footerLinks}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
