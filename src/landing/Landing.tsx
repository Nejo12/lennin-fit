import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { SocialProof } from '../components/SocialProof';
import { Features } from '../components/Features';
import { TilsfFramework } from '../components/TilsfFramework';
import { CTA } from '../components/CTA';
import styles from '../styles/App.module.scss';

const Landing: React.FC = () => {
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
          <a href="#tilsf">TILSF</a>
          <a href="#pricing">Pricing</a>
          <Link className={styles.ctaHeader} to="/login">
            Start Free
          </Link>
        </nav>
      </header>

      <main>
        <Hero />
        <SocialProof />
        <Features />
        <TilsfFramework />
        <CTA />
      </main>

      <footer className={styles.footer}>
        <div>© {new Date().getFullYear()} Lennin</div>
        <div className={styles.footerLinks}>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
