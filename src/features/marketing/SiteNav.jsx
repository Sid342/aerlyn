import { useEffect, useRef, useState } from 'react';
import { site } from '../../config/site.js';
import { productPath } from '../../routes.js';
import { BookButton } from './Booking.jsx';
import './SiteNav.css';

const shortName = (p) => p.name.replace(`${site.brand} `, '');
const ICON = { open: 'M4 7h16M4 12h16M4 17h16', close: 'M6 6l12 12M18 6L6 18' };

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const products = useRef(null);

  // <details> stays open until its summary is clicked again; close it on outside click and Escape.
  useEffect(() => {
    const menu = products.current;
    const onPointer = (e) => { if (!menu.contains(e.target)) menu.open = false; };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      if (!menu.open) return;
      menu.open = false;
      if (menu.contains(document.activeElement)) menu.querySelector('summary').focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Absolute "/#…" links so the same header works on every page.
  return (
    <header>
      <nav className="site-nav" aria-label="Main">
        <a className="site-nav-logo" href="/">{site.brand}</a>
        <ul className="site-nav-links">
          <li><a href="/#planner">Plan my home</a></li>
          <li><a href="/#how">How it works</a></li>
          <li>
            <details className="site-nav-products" ref={products}>
              <summary>Products</summary>
              <div className="site-nav-products-menu">
                {site.products.map((p) => <a key={p.id} href={productPath(p)}>{shortName(p)}</a>)}
              </div>
            </details>
          </li>
          <li><a href="/#faq">FAQ</a></li>
        </ul>
        <BookButton className="btn site-nav-cta" />
        <button type="button" className="site-nav-hamburger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Menu'} aria-expanded={open} aria-controls="site-menu">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d={open ? ICON.close : ICON.open} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </nav>
      {open && (
        <div id="site-menu" className="site-nav-mobile" onClick={close}>
          <a href="/#planner">Plan my home</a>
          <a href="/#how">How it works</a>
          <span className="site-nav-mobile-label">Products</span>
          {site.products.map((p) => <a key={p.id} className="sub" href={productPath(p)}>{shortName(p)}</a>)}
          <a href="/#faq">FAQ</a>
          <BookButton />
        </div>
      )}
    </header>
  );
}
