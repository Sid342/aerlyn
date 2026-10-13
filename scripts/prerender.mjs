// Runs after `vite build` and the SSR build: writes one static HTML file per route into dist/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const { routes, render, headFor, renderHead, sitemapXml, robotsTxt } = await import('../dist-ssr/entry-server.js');

const ROOT = '<div id="root"></div>';
const template = await readFile(`${dist}/index.html`, 'utf8');
const TITLE = /<title>.*?<\/title>/;
if (!template.includes(ROOT) || !TITLE.test(template)) {
  throw new Error('prerender: dist/index.html must contain a <title> and an empty #root');
}

for (const route of routes) {
  const file = dist + (route.path === '/' ? '/index.html' : route.path);
  const html = template
    .replace(TITLE, () => renderHead(headFor(route)))
    // data-path lets the client check that this is the page it was asked for before it hydrates
    .replace(ROOT, () => `<div id="root" data-path="${route.path}">${render(route.path)}</div>`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`prerendered ${route.path}`);
}

await writeFile(`${dist}/sitemap.xml`, sitemapXml());
await writeFile(`${dist}/robots.txt`, robotsTxt());
console.log('wrote sitemap.xml, robots.txt');
