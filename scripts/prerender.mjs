// Runs after `vite build` and the SSR build: writes one static HTML file per route into dist/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const { routes, render, headFor, renderHead } = await import('../dist-ssr/entry-server.js');

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
    .replace(ROOT, () => `<div id="root">${render(route.path)}</div>`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`prerendered ${route.path}`);
}
