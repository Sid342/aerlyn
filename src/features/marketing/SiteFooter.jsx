import { site, whatsappUrl } from '../../config/site.js';
import { productPath, PRIVACY_PATH, POLICY_PATHS } from '../../routes.js';
import './SiteFooter.css';

export default function SiteFooter() {
  const whatsapp = whatsappUrl(`Hi ${site.brand}`);
  return (
    <footer className="site-footer">
      <nav className="site-footer__links" aria-label="Footer">
        {site.products.map((p) => (
          <a key={p.id} href={productPath(p)}>{p.name.replace(`${site.brand} `, '')}</a>
        ))}
        <a href={PRIVACY_PATH}>Privacy Policy</a>
        <a href={POLICY_PATHS.terms}>Terms</a>
      </nav>
      <p className="site-footer__legal">
        © {new Date().getFullYear()} {site.brand} · {site.legalName} · {site.address}
        {site.gstin && <> · GSTIN {site.gstin}</>}
      </p>
      {(site.email || site.phone || whatsapp) && (
        <p className="site-footer__legal">
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
          {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
          {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
        </p>
      )}
    </footer>
  );
}
