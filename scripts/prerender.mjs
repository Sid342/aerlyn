// Runs after `vite build` and the SSR build: writes one static HTML file per route into dist/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const { routes, render } = await import('../dist-ssr/entry-server.js');

const ROOT = '<div id="root"></div>';
const template = await readFile(`${dist}/index.html`, 'utf8');
if (!template.includes(ROOT)) throw new Error(`prerender: ${ROOT} not found in dist/index.html`);

for (const route of routes) {
  const file = dist + (route.path === '/' ? '/index.html' : route.path);
  const html = template.replace(ROOT, () => `<div id="root">${render(route.path)}</div>`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`prerendered ${route.path}`);
}
