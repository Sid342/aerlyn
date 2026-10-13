import { site } from '../../config/site.js';
import './SiteFooter.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer__links">
        <a href="/privacy-policy.html">Privacy Policy</a>
        {site.products.map((p) => (
          <a key={p.id} href={`/products/${p.slug}.html`}>{p.name.replace(`${site.brand} `, '')}</a>
        ))}
      </nav>
      <p className="site-footer__legal">
        © 2026 {site.legalName} · {site.address}
        {site.email && <> · <a href={`mailto:${site.email}`}>{site.email}</a></>}
      </p>
    </footer>
  );
}
