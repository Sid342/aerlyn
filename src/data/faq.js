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
    a: `No. There is no civil work and no damage to walls. ${site.brand} Retrofit modules work with your existing switches and do not need a neutral wire.`,
  },
  {
    q: 'How long does installation take?',
    a: 'Most homes are done in less than a day.',
  },
  {
    q: 'Is the home visit really free?',
    a: 'Yes. We check your wiring and suggest what fits your home. You decide after that.',
  },
  {
    q: 'What can I automate?',
    a: 'Lights, fans, ACs that use a remote, curtains, geysers, sockets, door locks, cameras, and sensors for motion, gas and smoke.',
  },
  {
    q: 'Does it work with Alexa and Google Home?',
    a: `Yes. ${site.brand} works with Alexa, Google Home and Siri.`,
  },
  {
    q: 'Can I control my home when I am away?',
    a: 'Yes. From your phone you can lock the door, get an alert when it opens and check your cameras.',
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
