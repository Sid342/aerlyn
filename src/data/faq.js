import { site } from '../config/site.js';

const names = site.products.map((p) => p.name.replace(`${site.brand} `, '')).join(' and ');
const spec = (label) => site.products[0].specs.find(([l]) => l === label)?.[1];
const warranty = spec('Warranty');

// Pre-sale questions. Every answer restates something the site already says elsewhere
// (marketing sections, product features/specs, device blurbs) — add no new claims here.
// Rendered on the landing page and emitted as FAQPage structured data from this one list.
export const FAQ = [
  {
    q: 'Do I need to rewire my home or break walls?',
    a: `No. Installation needs no civil work and does no damage to walls. ${site.brand} Retrofit modules make your existing switches app and voice controlled, and support no-neutral-wire installation.`,
  },
  {
    q: 'How long does installation take?',
    a: 'A full home is typically complete in 4–8 hours — under a day — installed by certified technicians.',
  },
  {
    q: 'Is the home visit really free?',
    a: 'Yes. The home consultation is completely free, with zero obligation. Our expert visits your home, assesses your wiring, confirms compatibility and designs a solution for your home.',
  },
  {
    q: 'What can I automate?',
    a: 'Lights, fans, ACs with an IR remote, curtains, geysers, sockets, door locks, cameras, and motion and gas / smoke sensors — controlled from one app, by voice, or by scenes and schedules.',
  },
  {
    q: 'Does it work with Alexa and Google Home?',
    a: `Yes. ${site.brand} voice control works with Alexa, Google and Siri, and the Retrofit switch modules support app and voice control through Alexa and Google Home.`,
  },
  {
    q: 'Can I control my home when I am away?',
    a: 'Yes. From your phone you can lock the door remotely, see lock status in real time, get notified the moment your door opens, and check your cameras from anywhere.',
  },
  {
    q: 'Is there a monthly subscription?',
    a: 'No. There is no subscription fee.',
  },
  warranty && {
    q: 'What warranty do the switch modules carry?',
    a: `The ${site.brand} ${names} modules carry a ${warranty.toLowerCase()} warranty.`,
  },
].filter(Boolean);
