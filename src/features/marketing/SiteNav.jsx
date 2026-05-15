import { useState } from 'react';
import './SiteNav.css';
import logo from '../../assets/logo.png';

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="site-nav">
        <a className="site-nav-logo" href="#hero"><img src={logo} alt="Aerlyn" /></a>
        <ul className="site-nav-links">
          <li><a href="#why" onClick={() => setOpen(false)}>Why Automate</a></li>
          <li><a href="#planner" onClick={() => setOpen(false)}>Planner</a></li>
          <li><a href="#how" onClick={() => setOpen(false)}>How it Works</a></li>
          <li><a href="#contact" onClick={() => setOpen(false)}>Contact</a></li>
        </ul>
        <a className="site-nav-cta" href="#planner">Build My Plan</a>
        <button type="button" className="site-nav-hamburger" onClick={() => setOpen((o) => !o)} aria-pressed={open}>
          {open ? '✕' : '☰'}
        </button>
      </nav>
      <div className={`site-nav-mobile${open ? ' open' : ''}`}>
        <a href="#why" onClick={() => setOpen(false)}>Why Automate</a>
        <a href="#planner" onClick={() => setOpen(false)}>Planner</a>
        <a href="#how" onClick={() => setOpen(false)}>How it Works</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
      </div>
    </>
  );
}
