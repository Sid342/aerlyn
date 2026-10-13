import { describe, it, expect, afterEach } from 'vitest';
import { headFor, renderHead, prune, sitemapXml, robotsTxt } from '../head.js';
import { routes } from '../../routes.js';
import { site } from '../../config/site.js';

const heads = routes.map((route) => ({ route, head: headFor(route) }));
const byPage = (page) => heads.find((h) => h.route.page === page).head;
const types = (head) => head.jsonLd.map((ld) => ld['@type']);

// Every leaf value in a JSON-LD tree.
function leaves(value) {
  if (value && typeof value === 'object') return Object.values(value).flatMap(leaves);
  return [value];
}

describe('headFor', () => {
  it('gives every route a unique title, description and canonical', () => {
    for (const field of ['title', 'description', 'canonical']) {
      const values = heads.map(({ head }) => head[field]);
      expect(values.every(Boolean)).toBe(true);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('keeps titles under ~60 characters and descriptions under ~160', () => {
    for (const { head } of heads) {
      expect(head.title.length).toBeLessThanOrEqual(60);
      expect(head.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('builds the canonical from the origin and the route path', () => {
    expect(byPage('landing').canonical).toBe('https://aerlyn.in/');
    expect(byPage('privacy').canonical).toBe('https://aerlyn.in/privacy-policy.html');
    for (const { route, head } of heads) {
      expect(head.canonical).toBe(site.origin + route.path);
      expect(head.og['og:url']).toBe(head.canonical);
    }
  });

  it('sets Open Graph and Twitter tags on every route', () => {
    for (const { head } of heads) {
      expect(head.og['og:title']).toBe(head.title);
      expect(head.og['og:description']).toBe(head.description);
      expect(head.og['og:type']).toBe('website');
      expect(head.og['og:site_name']).toBe(site.brand);
      expect(head.og['og:locale']).toBe('en_IN');
      expect(head.og['og:image']).toBe('https://aerlyn.in/og-image.png');
      expect(head.twitter['twitter:card']).toBe('summary_large_image');
    }
  });

  it('marks only the checkout noindex', () => {
    expect(byPage('checkout').robots).toBe('noindex');
    expect(heads.filter(({ head }) => head.robots).length).toBe(1);
  });

  it('has no null, undefined or empty value anywhere in the JSON-LD', () => {
    for (const { head } of heads) {
      for (const leaf of head.jsonLd.flatMap(leaves)) {
        expect(leaf === null || leaf === undefined || leaf === '').toBe(false);
      }
      expect(() => JSON.parse(JSON.stringify(head.jsonLd))).not.toThrow();
    }
  });

  it('describes the business on the landing page without the unknown fields', () => {
    const head = byPage('landing');
    expect(types(head)).toEqual(expect.arrayContaining(['LocalBusiness', 'WebSite']));
    const business = head.jsonLd.find((ld) => ld['@type'] === 'LocalBusiness');
    expect(business.name).toBe(site.brand);
    expect(business.address.streetAddress).toBe(site.address);
    // null in config today — must not appear until the owner fills them
    for (const key of ['telephone', 'taxID', 'areaServed']) expect(key in business).toBe(false);
    expect(JSON.stringify(head.jsonLd)).not.toMatch(/aggregateRating|"review"/);
  });

  it('describes each product with an offer and breadcrumbs', () => {
    for (const { route, head } of heads.filter((h) => h.route.page === 'product')) {
      expect(types(head)).toEqual(['Product', 'BreadcrumbList']);
      const [product, crumbs] = head.jsonLd;
      expect(product.sku).toBe(route.product.id);
      expect(product.brand.name).toBe(site.brand);
      expect(product.image).toMatch(/^https:\/\/aerlyn\.in\//);
      expect(product.offers).toEqual({
        '@type': 'Offer',
        price: route.product.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: head.canonical,
      });
      expect(crumbs.itemListElement.map((i) => i.item)).toEqual(['https://aerlyn.in/', head.canonical]);
    }
  });

  it('gives policy pages breadcrumbs and the checkout no structured data', () => {
    expect(types(byPage('privacy'))).toEqual(['BreadcrumbList']);
    expect(byPage('checkout').jsonLd).toEqual([]);
  });
});

describe('headFor with config changes', () => {
  const saved = { ...site };
  afterEach(() => { Object.assign(site, saved); });

  it('adds the phone and service area once they are configured', () => {
    Object.assign(site, { phone: '+919800000000', serviceArea: 'Hisar' });
    const head = headFor(routes[0]);
    const business = head.jsonLd.find((ld) => ld['@type'] === 'LocalBusiness');
    expect(business.telephone).toBe('+919800000000');
    expect(business.areaServed).toBe('Hisar');
    expect(head.description).toContain('in Hisar');
  });

  it('names no place while the service area is unknown', () => {
    expect(site.serviceArea).toBeNull();
    for (const { head } of heads) expect(head.title + head.description).not.toMatch(/Hisar/);
  });

  it('falls back to Organization without an address', () => {
    Object.assign(site, { address: null });
    const business = headFor(routes[0]).jsonLd[0];
    expect(business['@type']).toBe('Organization');
    expect('address' in business).toBe(false);
  });
});

describe('prune', () => {
  it('drops null, undefined and empty values at any depth', () => {
    expect(prune({ a: 1, b: null, c: { d: undefined, e: '' }, f: [null, 'x'], g: [], h: 0, i: false }))
      .toEqual({ a: 1, f: ['x'], h: 0, i: false });
  });
});

describe('renderHead', () => {
  it('escapes text and keeps JSON-LD parseable', () => {
    const html = renderHead({
      title: 'A & B <x>', description: 'say "hi"', canonical: 'https://aerlyn.in/', robots: null,
      og: { 'og:title': 'A & B' }, twitter: {}, jsonLd: [{ name: '</script><b>' }],
    });
    expect(html).toContain('<title>A &amp; B &lt;x&gt;</title>');
    expect(html).toContain('content="say &quot;hi&quot;"');
    expect(html).not.toContain('robots');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const json = html.match(/<script type="application\/ld\+json">(.*)<\/script>/)[1];
    expect(JSON.parse(json)).toEqual({ name: '</script><b>' });
  });

  it('renders the robots tag for the checkout', () => {
    expect(renderHead(headFor(routes.find((r) => r.noindex)))).toContain('<meta name="robots" content="noindex" />');
  });
});

describe('sitemap and robots', () => {
  it('lists every indexable route and leaves the checkout out', () => {
    const xml = sitemapXml();
    for (const r of routes) {
      expect(xml.includes(`<loc>${site.origin}${r.path}</loc>`)).toBe(!r.noindex);
    }
  });

  it('allows all crawlers and points to the sitemap', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n\nSitemap: https://aerlyn.in/sitemap.xml\n');
  });
});
