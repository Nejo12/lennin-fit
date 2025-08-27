import React from 'react';
import s from './TilsfFramework.module.scss';

export const TilsfFramework: React.FC = () => {
  return (
    <section id="tilsf" className={s.tilsfFramework}>
      <div className={s.container}>
        <div className={s.header}>
          <h2>Built on TILSF</h2>
          <p className={s.subtitle}>
            More than just another app. Lennin is built on a proven framework
            that helps freelancers work smarter, not harder.
          </p>
        </div>

        <div className={s.cards}>
          <div className={s.card}>
            <div className={s.cardIcon}>📋</div>
            <h3>Tasks</h3>
            <p>Organize and finish work with clarity and purpose.</p>
          </div>

          <div className={s.card}>
            <div className={s.cardIcon}>💰</div>
            <h3>Invoices</h3>
            <p>Get paid faster with streamlined billing and tracking.</p>
          </div>

          <div className={s.card}>
            <div className={s.cardIcon}>👥</div>
            <h3>Leads</h3>
            <p>Manage your clients and nurture relationships effectively.</p>
          </div>

          <div className={s.card}>
            <div className={s.cardIcon}>📅</div>
            <h3>Schedule</h3>
            <p>Plan your time and respect your boundaries.</p>
          </div>

          <div className={s.card}>
            <div className={s.cardIcon}>🎯</div>
            <h3>Focus</h3>
            <p>Stress less, achieve more with intentional work.</p>
          </div>
        </div>

        <div className={s.footer}>
          <p className={s.frameworkNote}>
            TILSF isn't just a methodology—it's your roadmap to freelance
            success.
          </p>
        </div>
      </div>
    </section>
  );
};
