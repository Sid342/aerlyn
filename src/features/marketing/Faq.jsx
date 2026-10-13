import { FAQ } from '../../data/faq.js';
import './Faq.css';

export default function Faq() {
  return (
    <section id="faq" className="section">
      <h2 className="section-title">Common questions</h2>
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
