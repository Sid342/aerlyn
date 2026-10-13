import { useEffect, useRef, useState } from 'react';
import { site } from '../../config/site.js';
import { productPath } from '../../routes.js';
import { useCart } from '../cart/CartContext.jsx';
import { cartCount } from '../../lib/cart.js';
import './SiteNav.css';

// Absolute "/#…" links so the same nav works on every page.
const LINKS = [
  ['/#why', 'Why Automate'],
  ['/#planner', 'Planner'],
  ['/#how', 'How it Works'],
  ['/#contact', 'Contact'],
];
const shortName = (p) => p.name.replace(`${site.brand} `, '');

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const { cart, openCart } = useCart();
  const count = cartCount(cart);
  const close = () => setOpen(false);
  const products = useRef(null);

  // <details> stays open until its summary is clicked again; close it on outside click and Escape.
  useEffect(() => {
    const menu = products.current;
    const onPointer = (e) => { if (!menu.contains(e.target)) menu.open = false; };
    const onKey = (e) => {
      if (e.key !== 'Escape' || !menu.open) return;
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
  return (
    <header>
      <nav className="site-nav" aria-label="Main">
        <a className="site-nav-logo" href="/">{site.brand}</a>
        <ul className="site-nav-links">
          {LINKS.slice(0, 3).map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
          <li>
            <details className="site-nav-products" ref={products}>
              <summary>Products</summary>
              <div className="site-nav-products-menu">
                {site.products.map((p) => <a key={p.id} href={productPath(p)}>{shortName(p)}</a>)}
              </div>
            </details>
          </li>
          {LINKS.slice(3).map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <div className="site-nav-right">
          <button type="button" className="site-nav-cart" onClick={openCart} aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
            <span aria-hidden="true">🛒</span>
            <span className="site-nav-cart-count" aria-hidden="true">{count}</span>
          </button>
          <a className="site-nav-cta" href="/#planner">Build My Plan</a>
          <button type="button" className="site-nav-hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>
      <div className={`site-nav-mobile${open ? ' open' : ''}`}>
        {LINKS.slice(0, 3).map(([href, label]) => <a key={href} href={href} onClick={close}>{label}</a>)}
        {site.products.map((p) => <a key={p.id} href={productPath(p)}>{shortName(p)}</a>)}
        {LINKS.slice(3).map(([href, label]) => <a key={href} href={href} onClick={close}>{label}</a>)}
      </div>
    </header>
  );
}
