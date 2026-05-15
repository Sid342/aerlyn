import './Hero.css';
import logo from '../../assets/logo.png';

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <img src={logo} alt="Aerlyn" className="hero-logo" />
      <div className="hero-eyebrow">India's Most Comprehensive Home Automation</div>
      <h1 className="hero-h1">
        Stop doing things<br />
        <em>your home</em> should<br />
        do for you.
      </h1>
      <p className="hero-sub">
        Every time you walk room to room switching off lights, every time you forget to turn off the
        geyser, every time you wonder if you locked the door — your home is working against you.
        Aerlyn fixes that.
      </p>
      <div className="hero-ctas">
        <a href="#planner" className="hero-cta-primary">Build My Smart Home Plan</a>
        <a href="#why" className="hero-cta-secondary">Why do I need this?</a>
      </div>
      <div className="hero-proof">
        {[
          { number: '500+', label: 'Homes automated' },
          { number: '<1 day', label: 'Full installation' },
          { number: '40%', label: 'Avg. energy saved' },
          { number: '₹0', label: 'Subscription fee, ever' },
        ].map(({ number, label }) => (
          <div key={label} className="hero-proof-item">
            <div className="hero-proof-number">{number}</div>
            <div className="hero-proof-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
