import './SiteFooter.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer__links">
        <a href="/privacy-policy.html">Privacy Policy</a>
        <a href="/products/retrofit-1-switch.html">Retrofit 1-Switch</a>
        <a href="/products/retrofit-2-switch.html">Retrofit 2-Switch</a>
      </nav>
      <p className="site-footer__legal">
        © 2026 Home Decor · 216, Green Square Market, Hisar – 125001 ·{' '}
        <a href="mailto:shaurya.goel.34@gmail.com">shaurya.goel.34@gmail.com</a>
      </p>
    </footer>
  );
}
