import React from 'react';
import s from './Hero.module.scss';

export const Hero: React.FC = () => {
  return (
    <section className={s.hero}>
      <div className={s.colText}>
        <h1>Fit your whole business in one app.</h1>
        <p>
          Stop juggling 5 tools. Lennin gives freelancers tasks, clients, and
          invoices in one place — so you work smart and stress less.
        </p>
        <div className={s.actions}>
          <a href="#start" className={s.btnPrimary}>
            Start Free
          </a>
          <a href="#features" className={s.btnGhost}>
            See how it fits
          </a>
        </div>
        <ul className={s.bullets}>
          <li>Clients & projects in one hub</li>
          <li>Calendar-aware tasks</li>
          <li>Invoice & payment tracking</li>
        </ul>
      </div>
      <div className={s.colVisual} aria-hidden="true">
        <div className={s.cardGrid}>
          <div className={s.card}>
            <div className={s.cardTitle}>This week</div>
            <ul>
              <li>
                Send invoice — <strong>Acme</strong>
              </li>
              <li>
                Design review — <strong>Tue 14:00</strong>
              </li>
              <li>
                Follow-up email — <strong>Pending</strong>
              </li>
            </ul>
          </div>
          <div className={s.cardAccent}>
            <div className={s.metricLabel}>Unpaid invoices</div>
            <div className={s.metricValue}>€ 2,430</div>
          </div>
          <div className={s.card}>
            <div className={s.cardTitle}>Today</div>
            <ul>
              <li>Draft proposal</li>
              <li>Client call</li>
              <li>Schedule posts</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
