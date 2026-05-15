import './HowItWorks.css';

const STEPS = [
  { num: '01 — Understand', title: 'Use the planner above', body: 'Build your room-by-room requirements. Understand why each solution matters. Share it with our team — or just tell us what problems you want to solve.' },
  { num: '02 — Visit', title: 'Free home assessment', body: 'Our expert visits your home at no cost. They assess your wiring, confirm compatibility, refine your requirements, and design the optimal solution for your specific home.' },
  { num: '03 — Install', title: 'Done in under a day', body: 'Certified technicians install everything cleanly. No civil work. No damage to walls. No hassle. Typically complete in 4–8 hours for a full home.' },
  { num: '04 — Live', title: 'Your home takes over', body: 'One app. Voice commands. Scenes. Schedules. Energy monitoring. And we stay on call — for anything, anytime. Your home gets smarter the longer you use it.' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="how-section">
      <div className="section-eyebrow" style={{ color: 'var(--amber, #F59E0B)' }}>From plan to smart home</div>
      <h2 className="section-title">Four steps to a home<br />that works for you.</h2>
      <div className="how-steps">
        {STEPS.map((s) => (
          <div key={s.num} className="how-step">
            <div className="how-step-num">{s.num}</div>
            <div className="how-step-title">{s.title}</div>
            <div className="how-step-body">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
