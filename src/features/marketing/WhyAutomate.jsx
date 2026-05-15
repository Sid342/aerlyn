import './WhyAutomate.css';

const PAIN_CARDS = [
  { icon: '💡', problem: 'Daily frustration', title: 'Walking room to room switching off lights before bed', desc: "Every night — the same ritual. Check the bedroom, kitchen, living room, bathrooms. Miss one and you're back up at 2am.", solution: 'One "Good Night" scene turns off every light and fan in your entire home. One tap from bed. Or it happens automatically when you set the schedule.' },
  { icon: '🔥', problem: 'Energy waste', title: 'The geyser left on for hours — again', desc: 'Geysers left on for 3–4 hours instead of 15 minutes. Fans running in empty rooms. Lights on all day while you\'re at work. Your electricity bill reflects all of it.', solution: 'Smart switches auto-cut the geyser after 20 minutes. BLDC fans use 65% less power. Occupancy-based automation turns off devices in empty rooms.' },
  { icon: '🔒', problem: 'Security anxiety', title: '"Did I lock the front door?" — while you\'re halfway to work', desc: "You've turned back to check. You've called family to verify. It's not paranoia — it's the gap between what you know and what you can see.", solution: 'Smart locks show lock/unlock status in real-time on your phone. Lock remotely from anywhere. Get notified the moment your door opens — day or night.' },
  { icon: '🌡️', problem: 'Comfort friction', title: 'Getting up at 3am to change the fan speed or adjust lights', desc: "Half-asleep, fumbling for a switch on the wall in the dark. Or lying in bed too hot because you can't be bothered to get up and change the fan.", solution: "Control every fan, light, and AC from your phone without getting up. Set a sleep scene that auto-dims lights and slows fans at bedtime — no action needed." },
  { icon: '👶', problem: 'Safety gaps', title: "You can't watch every room, every appliance, at the same time", desc: "Kids home alone. Gas left on in the kitchen. An electrical surge while you sleep. These aren't unlikely — they're just things you can't always prevent manually.", solution: 'Gas and smoke sensors send instant phone alerts. Motion sensors watch entry points. 5MP cameras let you check any room from anywhere, any time.' },
  { icon: '👋', problem: 'Visitor management', title: "Letting in the maid, courier, or family when you're not home", desc: "Sharing keys, trusting people blindly, or making someone wait outside because you're stuck in a meeting. Every option is inconvenient or unsafe.", solution: 'Smart locks grant time-limited access codes to specific people. You can unlock remotely from your phone and get a log of every entry and exit.' },
];

export default function WhyAutomate() {
  return (
    <section id="why" className="why-section">
      <div className="section-eyebrow rose">Real problems, solved permanently</div>
      <h2 className="section-title">You already know your home<br />is working against you.</h2>
      <p className="section-body">These aren't hypothetical benefits. These are things that happen in every Indian home, every single day — and things Aerlyn eliminates completely.</p>
      <div className="pain-grid">
        {PAIN_CARDS.map((card) => (
          <div key={card.problem} className="pain-card">
            <span className="pain-icon">{card.icon}</span>
            <div className="pain-problem-label">{card.problem}</div>
            <div className="pain-title">{card.title}</div>
            <div className="pain-desc">{card.desc}</div>
            <div className="pain-solution-label">Aerlyn solution</div>
            <div className="pain-solution">{card.solution}</div>
          </div>
        ))}
      </div>
      <div className="why-shift">
        <div className="why-shift-eyebrow">The shift automation creates</div>
        <div className="why-shift-headline">From a home you <em>manage</em> — to a home that <strong>takes care of you.</strong></div>
        <p className="why-shift-sub">Smart home automation isn't a luxury add-on. It's the difference between spending mental energy on your home versus your home spending its energy on you.</p>
        <a href="#planner" className="hero-cta-primary">Show me what I need →</a>
      </div>
    </section>
  );
}
