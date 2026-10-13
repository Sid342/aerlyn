import './WhatItDoes.css';

// [the problem, what you get]
const PAIRS = [
  ['Lights left on at night.', 'Turn off the whole house from your bed with one tap.'],
  ['Geyser left running.', 'It switches itself off after the time you set.'],
  ['Not sure you locked the door.', 'Check the lock on your phone and lock it from wherever you are.'],
];

export default function WhatItDoes() {
  return (
    <section id="what" className="section">
      <h2 className="section-title">What it does for you</h2>
      <ul className="pairs">
        {PAIRS.map(([problem, result]) => (
          <li key={problem}>
            <span className="pairs-problem">{problem}</span>
            <svg className="pairs-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="pairs-result">{result}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
