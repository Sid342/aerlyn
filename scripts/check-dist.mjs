// Last build step: fails the build if a prerendered page is missing or malformed.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const { routes, headFor, sitemapXml, robotsTxt } = await import('../dist-ssr/entry-server.js');
const { copyProblems, copyStats } = await import('../src/lib/copyCheck.js');

const problems = [];
const count = (html, re) => (html.match(re) || []).length;

for (const route of routes) {
  const file = route.path === '/' ? '/index.html' : route.path;
  const fail = (msg) => problems.push(`${file}: ${msg}`);
  let html;
  try {
    html = await readFile(dist + file, 'utf8');
  } catch {
    fail('file missing');
    continue;
  }
  const head = headFor(route);

  if (!html.includes('<html lang="en-IN">')) fail('missing <html lang="en-IN">');
  if (count(html, /<title>/g) !== 1) fail('expected exactly one <title>');
  if (count(html, /<h1[\s>]/g) !== 1) fail(`expected exactly one <h1>, found ${count(html, /<h1[\s>]/g)}`);
  if (count(html, /<main[\s>]/g) !== 1) fail('expected exactly one <main>');
  if (!html.includes(`<link rel="canonical" href="${head.canonical}" />`)) fail('canonical missing or wrong');
  if (!/<meta name="description" content="[^"]+"/.test(html)) fail('description missing');
  if (/<img(?![^>]*\salt="[^"]+")[^>]*>/.test(html)) fail('<img> without alt text');
  if (/<img(?![^>]*\swidth=)[^>]*>/.test(html) || /<img(?![^>]*\sheight=)[^>]*>/.test(html)) fail('<img> without width/height');

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  if (blocks.length !== head.jsonLd.length) fail(`expected ${head.jsonLd.length} JSON-LD blocks, found ${blocks.length}`);
  if (blocks.length === 0) fail('no JSON-LD');
  for (const [, json] of blocks) {
    try {
      if (!JSON.parse(json)['@type']) fail('JSON-LD without @type');
    } catch {
      fail('JSON-LD does not parse');
    }
    if (/:null|undefined/.test(json)) fail('JSON-LD contains null/undefined');
  }
}

for (const [file, expected] of [['/sitemap.xml', sitemapXml()], ['/robots.txt', robotsTxt()]]) {
  const actual = await readFile(dist + file, 'utf8').catch(() => null);
  if (actual !== expected) problems.push(`${file}: missing or stale`);
}

// The home page stays short and plain: see docs/superpowers/specs/2026-10-14-simple-guided-site-design.md, section 3.
const home = await readFile(`${dist}/index.html`, 'utf8').catch(() => '');
for (const problem of copyProblems(home)) problems.push(`/index.html copy: ${problem}`);

if (problems.length) {
  console.error(`check-dist: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
const { words, longDashes } = copyStats(home);
console.log(`check-dist: ${routes.length} pages ok; home page ${words} words, ${longDashes} long dashes`);
