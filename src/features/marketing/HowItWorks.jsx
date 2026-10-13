import './HowItWorks.css';

const STEPS = [
  ['Plan', 'Pick your home above to see what we would fit.'],
  ['Free visit', 'We come over, check your wiring and settle the plan with you.'],
  ['Install', 'We fit everything without breaking walls. Most homes take less than a day.'],
  ['Use it', 'Control your home from the app, by voice or at the wall switch.'],
];

export default function HowItWorks() {
  return (
    <section id="how" className="section">
      <h2 className="section-title">How it works</h2>
      <ol className="how-steps">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="how-step">
            <span className="how-step-num num" aria-hidden="true">{i + 1}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
