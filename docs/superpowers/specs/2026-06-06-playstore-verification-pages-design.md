# Play Store Verification Pages — Design

**Date:** 2026-06-06
**Status:** Approved-pending-review
**Goal:** Add two publicly-hosted pages required for Google Play Store verification of the Aerlyn Android app: (1) a privacy policy page, (2) a retrofit smart-switch product page. References supplied by user: privacy modeled on https://kiot.io/privacy-policy/, product modeled on https://fuma.co.in/product-details/?id=1 .

## Constraints

- Play accepts only **Retrofit 1-switch or 2-switch** products on the linked product page → build both variants, submit either.
- Privacy policy URL must be a stable, directly-loadable URL (no fragment/anchor, no SPA 404 risk).
- Site is **not yet deployed**; no router, no `public/` dir today. Single-page React/Vite scroll site.

## Architecture

Standalone static HTML files placed in a new `public/` directory. Vite copies `public/` verbatim into `dist/` root at build, so files are served at their literal paths on any static host — no react-router, no SPA-fallback config, crawlable by Play's checker.

```
public/
  privacy-policy.html
  products/
    retrofit-1-switch.html
    retrofit-2-switch.html
  products/assets/        # product photos dropped here by user later
```

Post-deploy URLs:
- `https://<domain>/privacy-policy.html`
- `https://<domain>/products/retrofit-1-switch.html`
- `https://<domain>/products/retrofit-2-switch.html`

Each HTML file is fully self-contained: inline `<style>` using Aerlyn brand tokens (`--teal #00C8B4`, `--bg #080810`, light card surfaces), no external JS, no React. Responsive, mobile-first (Play reviewers open on phones).

A lightweight **footer** is added to `src/App.jsx` (new `src/features/marketing/SiteFooter.jsx` + css) linking Privacy Policy + both product pages, so the policy is reachable from the live site, not just a bare URL.

## Privacy Policy page

Company identity baked in:
- Entity: **Home Decor**
- Contact: **shaurya.goel.34@gmail.com**
- Address: **216, Green Square Market, Hisar – 125001**
- Effective date: **6 June 2026**

Sections (smart-home / KIOT-style, accurate to a BLE/WiFi smart-switch app):
1. Introduction & who we are
2. Information we collect — account info, home/room configuration, device-control commands, BLE/WiFi device connectivity data, app usage & diagnostics
3. How we use your information
4. Sharing & third parties — cloud hosting, voice assistants (Alexa, Google Home)
5. Data retention
6. Security
7. Your rights — access, correction, deletion
8. Children's privacy
9. Changes to this policy
10. Contact us

## Product pages (1-switch & 2-switch)

Layout mirrors the fuma reference, brand = Aerlyn (Home Decor):
1. Header (Aerlyn logo/wordmark + back-to-site link)
2. Hero product image + "Best Seller" badge
3. Title + tagline
4. Price block (sale + struck regular)
5. Key Features list
6. Quantity/stock note + primary CTA ("Buy" / "Contact to order" → mailto support)
7. Trust badges — warranty, returns, shipping
8. Technical Specifications table
9. Footer (company info + privacy link)

Specs (mirrored from fuma id=1, adapted per gang count):

| Spec | Retrofit 1-Switch | Retrofit 2-Switch |
|------|-------------------|-------------------|
| Model | AER-SW1G-WiFi | AER-SW2G-WiFi |
| Connectivity | WiFi 2.4 GHz 802.11 b/g/n | same |
| Load capacity | 800 W (1 gang) | 800 W per gang (2 gang) |
| Voltage | 100–240 V AC, 50/60 Hz | same |
| Panel material | Tempered Glass + ABS | same |
| Warranty | 1 Year | 1 Year |
| Regular price | ₹3,286 | ₹3,286 |
| Sale price | ₹2,300 | ₹2,300 |

Key features (both): capacitive touch, scene & schedule automation, App + voice control (Alexa / Google Home), no-neutral-wire install, child lock & overload protection.

## Content honesty

No fabricated star ratings or review counts (Play + consumer-law risk) — the fuma "4.8/128 reviews" block is **omitted**. Product image: placeholder box referencing `products/assets/retrofit-1-switch.jpg` etc.; user drops real photos before publish. Prices mirror the user-supplied reference and should be confirmed before submission.

## Testing

Static HTML, no JS logic → no unit tests. Verification:
- `npm run build` → confirm the three HTML files + assets land in `dist/` at correct paths.
- `npm run preview` → open each URL, check render + brand styling + working links/mailto on mobile width.
- Existing 89 tests must still pass (footer addition touches App.jsx only).

## Out of scope

react-router, backend, real e-commerce checkout/cart, payment, analytics.
