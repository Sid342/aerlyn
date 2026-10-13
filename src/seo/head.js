import { site } from '../config/site.js';
import { routes } from '../routes.js';
import { FAQ } from '../data/faq.js';
import { policyDoc } from '../data/policies.js';

const OG_IMAGE = { path: '/og-image.png', width: 1200, height: 630 };
const LOGO_PATH = '/favicon.png';
const abs = (path) => site.origin + path;

// Drop null / undefined / empty values at any depth, so unknown config never reaches the page.
export function prune(value) {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, prune(v)])
      .filter(([, v]) => v !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value === null || value === undefined || value === '' ? undefined : value;
}

const BUSINESS_ID = abs('/#business');

function business() {
  return {
    '@context': 'https://schema.org',
    // LocalBusiness needs a street address; without one this is a plain Organization.
    '@type': site.address ? 'LocalBusiness' : 'Organization',
    '@id': BUSINESS_ID,
    name: site.brand,
    legalName: site.legalName,
    url: abs('/'),
    logo: abs(LOGO_PATH),
    image: abs(OG_IMAGE.path),
    email: site.email,
    telephone: site.phone,
    taxID: site.gstin,
    areaServed: site.serviceArea,
    address: site.address && { '@type': 'PostalAddress', streetAddress: site.address, addressCountry: 'IN' },
  };
}

function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.brand,
    url: abs('/'),
    inLanguage: 'en-IN',
    publisher: { '@id': BUSINESS_ID },
  };
}

function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function breadcrumbs(name, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  };
}

// Information only — nothing is sold on the site, so no offers and no ratings.
function productLd(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.id,
    description: p.tagline,
    image: abs(p.image),
    brand: { '@type': 'Brand', name: site.brand },
  };
}

function pageHead(route, url) {
  const area = site.serviceArea ? ` in ${site.serviceArea}` : '';
  switch (route.page) {
    case 'landing':
      return {
        title: `${site.brand} — Smart Home Automation, Planned Room by Room`,
        description: `Plan your smart home room by room with ${site.brand}${area}: smart switches, lighting, locks, cameras and scenes. Save your plan and get a free quote.`,
        jsonLd: [business(), website(), faqPage()],
      };
    case 'product': {
      const p = route.product;
      return {
        title: `${p.name} — Smart Wi-Fi Switch`,
        description: `${p.name}: ${p.tagline}`,
        jsonLd: [productLd(p), breadcrumbs(p.name, url)],
      };
    }
    case 'privacy':
      return {
        title: `Privacy Policy — ${site.brand}`,
        description: `How ${site.legalName} collects, uses and protects your information in the ${site.brand} smart-home app and on this website.`,
        jsonLd: [breadcrumbs('Privacy Policy', url)],
      };
    case 'policy': {
      const doc = policyDoc(route.policy);
      return {
        title: `${doc.title} — ${site.brand}`,
        description: doc.description,
        jsonLd: [breadcrumbs(doc.title, url)],
      };
    }
    default:
      throw new Error(`head: no head for page "${route.page}"`);
  }
}

// Everything that goes in <head> for one route.
export function headFor(route) {
  const canonical = abs(route.path);
  const { title, description, jsonLd } = pageHead(route, canonical);
  return {
    title,
    description,
    canonical,
    og: {
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:type': 'website',
      'og:image': abs(OG_IMAGE.path),
      'og:image:width': OG_IMAGE.width,
      'og:image:height': OG_IMAGE.height,
      'og:image:alt': site.brand,
      'og:site_name': site.brand,
      'og:locale': 'en_IN',
    },
    twitter: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': abs(OG_IMAGE.path),
    },
    jsonLd: jsonLd.map(prune),
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The head as an HTML string, for the prerender.
export function renderHead(head) {
  return [
    `<title>${esc(head.title)}</title>`,
    `<meta name="description" content="${esc(head.description)}" />`,
    `<link rel="canonical" href="${esc(head.canonical)}" />`,
    ...Object.entries(head.og).map(([k, v]) => `<meta property="${k}" content="${esc(v)}" />`),
    ...Object.entries(head.twitter).map(([k, v]) => `<meta name="${k}" content="${esc(v)}" />`),
    // "<" escaped so text in the data can never close the script element
    ...head.jsonLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
}

export function sitemapXml() {
  const urls = routes.map((r) => `  <url><loc>${esc(abs(r.path))}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`;
}
