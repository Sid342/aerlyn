# Play Store Verification Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a privacy-policy page and retrofit 1-switch/2-switch product pages as static HTML for Google Play Store verification.

**Architecture:** Self-contained static HTML files in `public/` (Vite copies verbatim to `dist/` root → stable, directly-loadable URLs, no router). A new React footer links them from the live site. No new dependencies.

**Tech Stack:** Vite 6, static HTML + inline CSS (Aerlyn brand tokens), React 18 footer component.

**Source of truth for all content/values:** [docs/superpowers/specs/2026-06-06-playstore-verification-pages-design.md](../specs/2026-06-06-playstore-verification-pages-design.md). Use its exact contact details, section list, and spec table — do not invent values.

**Shared brand tokens (use in every page's inline `<style>`):**
```css
:root{--teal:#00C8B4;--bg:#080810;--card:#12121c;--ink:#eef0f5;--muted:#9aa0ad;--line:#23232f;}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--teal)}
.wrap{max-width:860px;margin:0 auto;padding:48px 20px}
h1{font-size:2rem;margin-bottom:8px}h2{color:var(--teal);font-size:1.25rem;margin:28px 0 8px}
.muted{color:var(--muted)}
```
Mobile-first; verify at 375px width. Every page ends with a footer line: `Home Decor · 216, Green Square Market, Hisar – 125001 · <a href="mailto:shaurya.goel.34@gmail.com">shaurya.goel.34@gmail.com</a>`.

---

### Task 1: Privacy Policy page

**Files:**
- Create: `public/privacy-policy.html`

- [ ] **Step 1: Write the page**

Self-contained HTML5 doc. `<title>Privacy Policy — Aerlyn</title>`, meta viewport, meta description. Inline `<style>` = shared brand tokens above. Body = `.wrap` containing:
- `<h1>Privacy Policy</h1>` + `<p class="muted">Effective date: 6 June 2026</p>`
- The 10 numbered sections from the spec ("Privacy Policy page" → Sections list), each an `<h2>` + paragraph(s). Write real, accurate prose for a BLE/WiFi smart-switch app. Required substance per section:
  1. **Introduction** — Home Decor ("we"), operator of the Aerlyn smart-home app; this policy covers the app + these pages.
  2. **Information we collect** — account info (name, email); home/room configuration you create; device-control commands; BLE/Wi-Fi device connectivity data; app usage & diagnostics.
  3. **How we use your information** — operate device control, sync your configuration, improve the app, support, security.
  4. **Sharing & third parties** — cloud hosting providers; voice assistants (Amazon Alexa, Google Home) only when you link them; never sold.
  5. **Data retention** — kept while account active; deleted on request.
  6. **Security** — encryption in transit, access controls; no method is 100% secure.
  7. **Your rights** — access, correction, deletion; how to request (email).
  8. **Children's privacy** — not directed at under-13s; no knowing collection.
  9. **Changes to this policy** — posted here with updated effective date.
  10. **Contact us** — Home Decor, 216, Green Square Market, Hisar – 125001, shaurya.goel.34@gmail.com.
- Footer line (shared).

- [ ] **Step 2: Verify it loads standalone**

Run: `open public/privacy-policy.html` (or inspect in browser). Expected: renders styled, all 10 sections present, mailto link works, no console errors, no external requests.

- [ ] **Step 3: Commit**
```bash
/usr/bin/git add public/privacy-policy.html
/usr/bin/git commit -m "feat: add privacy policy page for Play Store verification"
```

---

### Task 2: Retrofit 1-Switch product page

**Files:**
- Create: `public/products/retrofit-1-switch.html`

- [ ] **Step 1: Write the page**

`<title>Aerlyn Retrofit 1-Switch — Smart Wi-Fi Switch</title>`. Inline shared brand tokens + small product-layout additions (`.price{font-size:1.6rem;color:var(--teal)} .strike{color:var(--muted);text-decoration:line-through;font-size:1rem;margin-left:8px} .badge{background:var(--teal);color:#04130f;font-weight:600;padding:2px 10px;border-radius:999px;font-size:.75rem} .hero{aspect-ratio:4/3;background:var(--card);border:1px dashed var(--line);border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--muted)} .cta{display:inline-block;background:var(--teal);color:#04130f;font-weight:600;padding:12px 22px;border-radius:10px;text-decoration:none;margin:18px 0} table{width:100%;border-collapse:collapse;margin-top:8px} td,th{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left} .trust{display:flex;gap:18px;flex-wrap:wrap;color:var(--muted);font-size:.9rem;margin-top:14px}`).

Blocks in order (mirror fuma layout, brand = Aerlyn; NO ratings/reviews block):
1. Header: `<a href="/">Aerlyn</a>` wordmark + `<a href="/">← Back to site</a>`.
2. Hero: `<div class="hero">` placeholder referencing image at `products/assets/retrofit-1-switch.jpg` (use `<img src="assets/retrofit-1-switch.jpg" onerror="this.replaceWith(...)">` OR a plain dashed box with text "Product photo — add retrofit-1-switch.jpg"). Add `<span class="badge">Best Seller</span>`.
3. `<h1>Aerlyn Retrofit 1-Switch</h1>` + tagline `<p class="muted">Smart Wi-Fi retrofit module — make one existing switch app & voice controlled.</p>`
4. Price: `<p class="price">₹2,300 <span class="strike">₹3,286</span></p>`
5. Key Features `<ul>`: capacitive touch, scene & schedule automation, App + voice control (Alexa / Google Home), no-neutral-wire install, child lock & overload protection.
6. CTA: `<a class="cta" href="mailto:shaurya.goel.34@gmail.com?subject=Order%20Aerlyn%20Retrofit%201-Switch">Contact to order</a>` + `<span class="muted">In stock · ships in 2–3 days</span>`.
7. Trust badges `.trust`: "1-Year Warranty", "Easy Returns", "Fast Shipping".
8. Specs `<table>` from spec table 1-Switch column: Model AER-SW1G-WiFi · Connectivity WiFi 2.4 GHz 802.11 b/g/n · Load 800 W (1 gang) · Voltage 100–240 V AC, 50/60 Hz · Panel Tempered Glass + ABS · Warranty 1 Year.
9. Footer line (shared).

- [ ] **Step 2: Verify standalone**

Run: `open public/products/retrofit-1-switch.html`. Expected: styled render, specs table correct, mailto CTA opens composer, back-link points to `/`, no console errors. Confirm NO review/rating text anywhere.

- [ ] **Step 3: Commit**
```bash
/usr/bin/git add public/products/retrofit-1-switch.html
/usr/bin/git commit -m "feat: add retrofit 1-switch product page"
```

---

### Task 3: Retrofit 2-Switch product page

**Files:**
- Create: `public/products/retrofit-2-switch.html`

- [ ] **Step 1: Write the page**

Identical structure/styling to Task 2 with 2-switch values (do NOT abbreviate — write the full file):
- `<title>Aerlyn Retrofit 2-Switch — Smart Wi-Fi Switch</title>`
- `<h1>Aerlyn Retrofit 2-Switch</h1>`, tagline "…make two existing switches app & voice controlled."
- Hero image `assets/retrofit-2-switch.jpg`, placeholder text "add retrofit-2-switch.jpg".
- Price identical: `₹2,300` / `₹3,286`.
- Same key-features list.
- CTA mailto subject `Order%20Aerlyn%20Retrofit%202-Switch`.
- Specs table 2-Switch column: Model **AER-SW2G-WiFi** · Connectivity WiFi 2.4 GHz 802.11 b/g/n · Load **800 W per gang (2 gang)** · Voltage 100–240 V AC, 50/60 Hz · Panel Tempered Glass + ABS · Warranty 1 Year.
- Footer line (shared).

- [ ] **Step 2: Verify standalone**

Run: `open public/products/retrofit-2-switch.html`. Expected: render correct, model = AER-SW2G-WiFi, load = 800 W per gang (2 gang), no reviews block.

- [ ] **Step 3: Commit**
```bash
/usr/bin/git add public/products/retrofit-2-switch.html
/usr/bin/git commit -m "feat: add retrofit 2-switch product page"
```

---

### Task 4: Site footer linking the pages

**Files:**
- Create: `src/features/marketing/SiteFooter.jsx`
- Create: `src/features/marketing/SiteFooter.css`
- Modify: `src/App.jsx` (import + render `<SiteFooter />` as the last child inside `<HomeProvider>`, after `<ContactCTA />`)

- [ ] **Step 1: Create SiteFooter.jsx**
```jsx
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
```

- [ ] **Step 2: Create SiteFooter.css**
```css
.site-footer { background:#0c0c14; border-top:1px solid #23232f; padding:40px 20px; text-align:center; }
.site-footer__links { display:flex; gap:24px; justify-content:center; flex-wrap:wrap; margin-bottom:16px; }
.site-footer__links a { color:#00C8B4; text-decoration:none; font-size:.95rem; }
.site-footer__links a:hover { text-decoration:underline; }
.site-footer__legal { color:#9aa0ad; font-size:.85rem; }
.site-footer__legal a { color:#9aa0ad; }
```

- [ ] **Step 3: Wire into App.jsx**

In `src/App.jsx`: add `import SiteFooter from './features/marketing/SiteFooter.jsx';` with the other marketing imports, and render `<SiteFooter />` immediately after `<ContactCTA />` (still inside `<HomeProvider>`).

- [ ] **Step 4: Verify dev render**

Run: `npm run dev`, open http://localhost:5173, scroll to bottom. Expected: footer with 3 links + legal line; clicking each link navigates to the static page (will 404 in `dev` for `public/` nested path is fine — confirm in build/preview at Task 5).

- [ ] **Step 5: Commit**
```bash
/usr/bin/git add src/features/marketing/SiteFooter.jsx src/features/marketing/SiteFooter.css src/App.jsx
/usr/bin/git commit -m "feat: add site footer linking privacy + product pages"
```

---

### Task 5: Build verification & regression

**Files:** none (verification only)

- [ ] **Step 1: Run existing test suite**

Run: `npm test -- --run`
Expected: 89/89 pass (footer change touches only App.jsx render tree; no reducer/lib change).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: success. Then confirm the static files copied to dist:
Run: `ls dist/privacy-policy.html dist/products/retrofit-1-switch.html dist/products/retrofit-2-switch.html`
Expected: all three paths exist.

- [ ] **Step 3: Preview & click-through**

Run: `npm run preview` → open http://localhost:4173
Expected: footer links resolve to the three pages (HTTP 200, styled). `/privacy-policy.html` and both `/products/*.html` load directly by URL. mailto CTAs work.

- [ ] **Step 4: Final commit (if any verification doc/notes added)**

No code change expected here. If `dist/` is gitignored (check `.gitignore`), do not commit build output. Otherwise nothing to commit.

---

## Post-implementation handoff to user (not a code task)

Before Play submission, user must:
- Drop real product photos at `public/products/assets/retrofit-1-switch.jpg` and `retrofit-2-switch.jpg`.
- Confirm prices ₹2,300 / ₹3,286 are correct for Aerlyn.
- Deploy `dist/` to the hosting domain; the final URLs to paste into Play Console:
  - `https://<domain>/privacy-policy.html`
  - `https://<domain>/products/retrofit-1-switch.html` (or 2-switch)
