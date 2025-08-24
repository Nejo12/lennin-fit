import React from 'react'
import s from './Features.module.scss'

export const Features: React.FC = () => (
  <section id="features" className={s.features}>
    <h2>Everything fits together</h2>
    <div className={s.grid}>
      <article className={s.item}>
        <h3>Clients & CRM lite</h3>
        <p>Store client details, notes, and link projects without the bloat.</p>
      </article>
      <article className={s.item}>
        <h3>Tasks that respect your calendar</h3>
        <p>Deadlines roll into your week so you always see what’s next.</p>
      </article>
      <article className={s.item}>
        <h3>Invoices & payments</h3>
        <p>Track what’s sent, what’s due, and what’s paid—at a glance.</p>
      </article>
      <article className={s.item}>
        <h3>AI assist (soon)</h3>
        <p>Break down projects, draft follow-ups, and plan your week in seconds.</p>
      </article>
    </div>

    <div id="pricing" className={s.pricing}>
      <div className={s.tier}>
        <h3>Free</h3>
        <p className={s.price}>€0</p>
        <ul>
          <li>Up to 2 clients</li>
          <li>Projects & tasks</li>
          <li>Basic calendar view</li>
        </ul>
      </div>
      <div className={`${s.tier} ${s.highlight}`}>
        <h3>Pro</h3>
        <p className={s.price}>€15/mo</p>
        <ul>
          <li>Unlimited clients & projects</li>
          <li>Invoice & payment tracking</li>
          <li>Calendar sync & exports</li>
        </ul>
      </div>
      <div className={s.tier}>
        <h3>Business</h3>
        <p className={s.price}>€49/mo</p>
        <ul>
          <li>Client portal</li>
          <li>Custom branding</li>
          <li>AI assistant</li>
        </ul>
      </div>
    </div>
  </section>
)
