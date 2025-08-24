import React from 'react'
import { Hero } from './components/Hero'
import { SocialProof } from './components/SocialProof'
import { Features } from './components/Features'
import { CTA } from './components/CTA'
import s from './styles/App.module.scss'

const App: React.FC = () => {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <a className={s.brand} href="/">
          <span className={s.logo}>L</span>
          <span className={s.word}>Lennin</span><span className={s.dot}>.fit</span>
        </a>
        <nav className={s.nav}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a className={s.ctaHeader} href="#start">Start Free</a>
        </nav>
      </header>

      <main>
        <Hero />
        <SocialProof />
        <Features />
        <CTA />
      </main>

      <footer className={s.footer}>
        <div>© {new Date().getFullYear()} Lennin</div>
        <div className={s.footerLinks}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </div>
  )
}

export default App
