import { FAQ } from '../../data/faq.js';
import './Faq.css';

export default function Faq() {
  return (
    <section id="faq" className="faq-section">
      <div className="section-eyebrow" style={{ color: 'var(--teal)' }}>Before you decide</div>
      <h2 className="section-title">Questions people ask<br />before automating.</h2>
      <div className="faq-list">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
