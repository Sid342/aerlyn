# Feature D: Marketing Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the existing Aerlyn Studio React app in a full marketing landing page, porting all content from the legacy `aerlyn_website.html` — hero, pain cards, day-in-your-life timeline, how it works, CTA contact, and lead capture modal.

**Architecture:** Single-scroll SPA. Marketing sections are React components rendered above/below the existing app. A sticky `SiteNav` with anchor links navigates the page. The existing React app becomes the `#planner` section. Lead modal sends to Formspree (existing endpoint, must swap before launch). No new router or dependencies.

**Tech Stack:** React 18 + Vite, CSS custom properties, Formspree (already wired in `sendFormspree.js`).

**Content source:** `assets/reference/aerlyn_website.html` (at project root: `/Users/sid/Documents/Home Decor/aerlyn_website.html`). Read it for all copy — don't write new marketing text.

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/features/marketing/SiteNav.jsx` |
| Create | `src/features/marketing/SiteNav.css` |
| Create | `src/features/marketing/Hero.jsx` |
| Create | `src/features/marketing/Hero.css` |
| Create | `src/features/marketing/WhyAutomate.jsx` |
| Create | `src/features/marketing/WhyAutomate.css` |
| Create | `src/features/marketing/DayInLife.jsx` |
| Create | `src/features/marketing/DayInLife.css` |
| Create | `src/features/marketing/HowItWorks.jsx` |
| Create | `src/features/marketing/HowItWorks.css` |
| Create | `src/features/marketing/ContactCTA.jsx` |
| Create | `src/features/marketing/ContactCTA.css` |
| Create | `src/features/marketing/LeadModal.jsx` |
| Create | `src/features/marketing/LeadModal.css` |
| Modify | `src/App.jsx` — add SiteNav + marketing sections as wrapper |
| Modify | `src/styles/global.css` — sticky nav offset |

---

### Task 1: SiteNav

**Files:**
- Create: `src/features/marketing/SiteNav.jsx`
- Create: `src/features/marketing/SiteNav.css`
- Modify: `src/styles/global.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create SiteNav.css**

```css
.site-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(8, 8, 16, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
.site-nav-logo { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--fg); text-decoration: none; }
.site-nav-links { display: flex; gap: 28px; list-style: none; margin: 0; padding: 0; }
.site-nav-links a { color: var(--muted); text-decoration: none; font-size: 0.85rem; transition: color 0.15s; }
.site-nav-links a:hover { color: var(--fg); }
.site-nav-cta { background: var(--teal); color: #000; border: none; border-radius: 8px; padding: 7px 16px; font-size: 0.82rem; font-weight: 700; cursor: pointer; text-decoration: none; white-space: nowrap; }

.site-nav-hamburger { display: none; background: none; border: none; color: var(--fg); font-size: 1.3rem; cursor: pointer; }
.site-nav-mobile { display: none; position: fixed; top: 56px; left: 0; right: 0; background: var(--bg, #080810); border-bottom: 1px solid var(--border); padding: 16px 24px; z-index: 99; flex-direction: column; gap: 16px; }
.site-nav-mobile a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
.site-nav-mobile.open { display: flex; }

@media (max-width: 640px) {
  .site-nav-links { display: none; }
  .site-nav-cta { display: none; }
  .site-nav-hamburger { display: block; }
}
```

- [ ] **Step 2: Create SiteNav.jsx**

```jsx
import { useState } from 'react';
import './SiteNav.css';

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="site-nav">
        <a className="site-nav-logo" href="#hero">Aerlyn</a>
        <ul className="site-nav-links">
          <li><a href="#why" onClick={() => setOpen(false)}>Why Automate</a></li>
          <li><a href="#planner" onClick={() => setOpen(false)}>Planner</a></li>
          <li><a href="#how" onClick={() => setOpen(false)}>How it Works</a></li>
          <li><a href="#contact" onClick={() => setOpen(false)}>Contact</a></li>
        </ul>
        <a className="site-nav-cta" href="#planner">Build My Plan</a>
        <button type="button" className="site-nav-hamburger" onClick={() => setOpen((o) => !o)} aria-pressed={open}>
          {open ? '✕' : '☰'}
        </button>
      </nav>
      <div className={`site-nav-mobile${open ? ' open' : ''}`}>
        <a href="#why" onClick={() => setOpen(false)}>Why Automate</a>
        <a href="#planner" onClick={() => setOpen(false)}>Planner</a>
        <a href="#how" onClick={() => setOpen(false)}>How it Works</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Add nav offset to global.css**

In `src/styles/global.css`, add:

```css
html { scroll-padding-top: 72px; }
body { padding-top: 56px; }
```

- [ ] **Step 4: Add SiteNav to App.jsx**

```jsx
import SiteNav from './features/marketing/SiteNav.jsx';
// At the very top of the App JSX, before everything:
<SiteNav />
```

- [ ] **Step 5: Run dev server — verify nav**

```
npm run dev
```

1. Sticky nav appears at top
2. Existing app content shifts down 56px (not hidden)
3. Mobile: hamburger shows, links hidden; tap hamburger opens dropdown

- [ ] **Step 6: Run all tests**

```
npm test
```

- [ ] **Step 7: Commit**

```bash
git add src/features/marketing/SiteNav.jsx src/features/marketing/SiteNav.css src/styles/global.css src/App.jsx
git commit -m "feat: SiteNav — sticky nav with anchor links + mobile hamburger"
```

---

### Task 2: Hero section

**Files:**
- Create: `src/features/marketing/Hero.jsx`
- Create: `src/features/marketing/Hero.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create Hero.css**

```css
.hero-section { padding: 100px 24px 80px; text-align: center; max-width: 760px; margin: 0 auto; }
.hero-eyebrow { font-size: 0.72rem; letter-spacing: 4px; text-transform: uppercase; color: var(--teal); font-weight: 600; margin-bottom: 16px; }
.hero-h1 { font-family: 'DM Serif Display', serif; font-size: clamp(2.2rem, 6vw, 4rem); letter-spacing: -1.5px; line-height: 1.1; color: var(--fg); margin: 0 0 20px; }
.hero-h1 em { color: var(--teal); font-style: italic; }
.hero-sub { font-size: clamp(0.95rem, 2vw, 1.1rem); color: var(--muted); line-height: 1.7; max-width: 560px; margin: 0 auto 36px; }
.hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.hero-cta-primary { background: var(--teal); color: #000; border: none; border-radius: 12px; padding: 14px 28px; font-size: 0.95rem; font-weight: 700; cursor: pointer; text-decoration: none; }
.hero-cta-secondary { background: transparent; color: var(--fg); border: 1px solid var(--border); border-radius: 12px; padding: 14px 28px; font-size: 0.95rem; cursor: pointer; text-decoration: none; }
.hero-proof { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-top: 56px; padding-top: 40px; border-top: 1px solid var(--border); }
.hero-proof-item { text-align: center; }
.hero-proof-number { font-family: 'DM Serif Display', serif; font-size: 2rem; color: var(--teal); }
.hero-proof-label { font-size: 0.75rem; color: var(--muted); margin-top: 4px; }
```

- [ ] **Step 2: Create Hero.jsx**

```jsx
import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-eyebrow">India's Most Comprehensive Home Automation</div>
      <h1 className="hero-h1">
        Stop doing things<br />
        <em>your home</em> should<br />
        do for you.
      </h1>
      <p className="hero-sub">
        Every time you walk room to room switching off lights, every time you forget to turn off the
        geyser, every time you wonder if you locked the door — your home is working against you.
        Aerlyn fixes that.
      </p>
      <div className="hero-ctas">
        <a href="#planner" className="hero-cta-primary">Build My Smart Home Plan</a>
        <a href="#why" className="hero-cta-secondary">Why do I need this?</a>
      </div>
      <div className="hero-proof">
        {[
          { number: '500+', label: 'Homes automated' },
          { number: '<1 day', label: 'Full installation' },
          { number: '40%', label: 'Avg. energy saved' },
          { number: '₹0', label: 'Subscription fee, ever' },
        ].map(({ number, label }) => (
          <div key={label} className="hero-proof-item">
            <div className="hero-proof-number">{number}</div>
            <div className="hero-proof-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add Hero to App.jsx**

In the JSX, after `<SiteNav />` and before the existing app content:

```jsx
import Hero from './features/marketing/Hero.jsx';
// render before existing content:
<Hero />
```

- [ ] **Step 4: Run dev server — verify hero**

```
npm run dev
```

1. Hero section with headline, sub, CTAs, and 4 proof stats visible
2. "Build My Smart Home Plan" scrolls to planner
3. Responsive — text scales on mobile

- [ ] **Step 5: Run all tests**

```
npm test
```

- [ ] **Step 6: Commit**

```bash
git add src/features/marketing/Hero.jsx src/features/marketing/Hero.css src/App.jsx
git commit -m "feat: Hero section — headline, CTAs, proof stats"
```

---

### Task 3: Why Automate section

**Files:**
- Create: `src/features/marketing/WhyAutomate.jsx`
- Create: `src/features/marketing/WhyAutomate.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create WhyAutomate.css**

```css
.why-section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
.section-eyebrow { font-size: 0.7rem; letter-spacing: 4px; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; }
.section-eyebrow.rose { color: #F43F5E; }
.section-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 4vw, 3rem); letter-spacing: -1px; line-height: 1.15; color: var(--fg); margin: 0 0 12px; }
.section-body { font-size: 0.95rem; color: var(--muted); line-height: 1.7; max-width: 560px; margin-bottom: 40px; }

.pain-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.pain-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
.pain-icon { font-size: 1.6rem; display: block; margin-bottom: 10px; }
.pain-problem-label { font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
.pain-title { font-weight: 700; font-size: 0.95rem; color: var(--fg); margin-bottom: 8px; line-height: 1.4; }
.pain-desc { font-size: 0.82rem; color: var(--muted); line-height: 1.65; margin-bottom: 14px; }
.pain-solution-label { font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; color: var(--teal); font-weight: 600; margin-bottom: 6px; }
.pain-solution { font-size: 0.82rem; color: var(--fg); line-height: 1.65; }

.why-shift { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 40px; text-align: center; margin-top: 16px; }
.why-shift-eyebrow { font-size: 0.65rem; letter-spacing: 4px; text-transform: uppercase; color: var(--teal); font-weight: 600; margin-bottom: 12px; }
.why-shift-headline { font-family: 'DM Serif Display', serif; font-size: clamp(1.3rem, 3vw, 2rem); letter-spacing: -0.5px; line-height: 1.25; margin-bottom: 14px; }
.why-shift-headline em { color: var(--muted); font-style: italic; }
.why-shift-headline strong { color: var(--teal); font-style: italic; font-weight: inherit; }
.why-shift-sub { font-size: 0.88rem; color: var(--muted); max-width: 560px; margin: 0 auto 24px; line-height: 1.7; }
```

- [ ] **Step 2: Create WhyAutomate.jsx**

```jsx
import './WhyAutomate.css';

const PAIN_CARDS = [
  {
    icon: '💡',
    problem: 'Daily frustration',
    title: 'Walking room to room switching off lights before bed',
    desc: 'Every night — the same ritual. Check the bedroom, kitchen, living room, bathrooms. Miss one and you\'re back up at 2am.',
    solution: 'One "Good Night" scene turns off every light and fan in your entire home. One tap from bed. Or it happens automatically when you set the schedule.',
  },
  {
    icon: '🔥',
    problem: 'Energy waste',
    title: 'The geyser left on for hours — again',
    desc: 'Geysers left on for 3–4 hours instead of 15 minutes. Fans running in empty rooms. Lights on all day while you\'re at work. Your electricity bill reflects all of it.',
    solution: 'Smart switches auto-cut the geyser after 20 minutes. BLDC fans use 65% less power. Occupancy-based automation turns off devices in empty rooms.',
  },
  {
    icon: '🔒',
    problem: 'Security anxiety',
    title: '"Did I lock the front door?" — while you\'re halfway to work',
    desc: 'You\'ve turned back to check. You\'ve called family to verify. It\'s not paranoia — it\'s the gap between what you know and what you can see.',
    solution: 'Smart locks show lock/unlock status in real-time on your phone. Lock remotely from anywhere. Get notified the moment your door opens — day or night.',
  },
  {
    icon: '🌡️',
    problem: 'Comfort friction',
    title: 'Getting up at 3am to change the fan speed or adjust lights',
    desc: 'Half-asleep, fumbling for a switch on the wall in the dark. Or lying in bed too hot because you can\'t be bothered to get up and change the fan.',
    solution: 'Control every fan, light, and AC from your phone without getting up. Set a sleep scene that auto-dims lights and slows fans at bedtime — no action needed.',
  },
  {
    icon: '👶',
    problem: 'Safety gaps',
    title: 'You can\'t watch every room, every appliance, at the same time',
    desc: 'Kids home alone. Gas left on in the kitchen. An electrical surge while you sleep. These aren\'t unlikely — they\'re just things you can\'t always prevent manually.',
    solution: 'Gas and smoke sensors send instant phone alerts. Motion sensors watch entry points. 5MP cameras let you check any room from anywhere, any time.',
  },
  {
    icon: '👋',
    problem: 'Visitor management',
    title: 'Letting in the maid, courier, or family when you\'re not home',
    desc: 'Sharing keys, trusting people blindly, or making someone wait outside because you\'re stuck in a meeting. Every option is inconvenient or unsafe.',
    solution: 'Smart locks grant time-limited access codes to specific people. You can unlock remotely from your phone and get a log of every entry and exit.',
  },
];

export default function WhyAutomate() {
  return (
    <section id="why" className="why-section">
      <div className="section-eyebrow rose">Real problems, solved permanently</div>
      <h2 className="section-title">You already know your home<br />is working against you.</h2>
      <p className="section-body">
        These aren't hypothetical benefits. These are things that happen in every Indian home, every
        single day — and things Aerlyn eliminates completely.
      </p>

      <div className="pain-grid">
        {PAIN_CARDS.map((card) => (
          <div key={card.problem} className="pain-card">
            <span className="pain-icon">{card.icon}</span>
            <div className="pain-problem-label">{card.problem}</div>
            <div className="pain-title">{card.title}</div>
            <div className="pain-desc">{card.desc}</div>
            <div className="pain-solution-label">Aerlyn solution</div>
            <div className="pain-solution">{card.solution}</div>
          </div>
        ))}
      </div>

      <div className="why-shift">
        <div className="why-shift-eyebrow">The shift automation creates</div>
        <div className="why-shift-headline">
          From a home you <em>manage</em> — to a home that <strong>takes care of you.</strong>
        </div>
        <p className="why-shift-sub">
          Smart home automation isn't a luxury add-on. It's the difference between spending mental
          energy on your home versus your home spending its energy on you.
        </p>
        <a href="#planner" className="hero-cta-primary">Show me what I need →</a>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add to App.jsx** (after Hero, before the planner):

```jsx
import WhyAutomate from './features/marketing/WhyAutomate.jsx';
<WhyAutomate />
```

- [ ] **Step 4: Run dev server — verify 6 pain cards + shift block render**

```
npm run dev
```

- [ ] **Step 5: Run all tests**

```
npm test
```

- [ ] **Step 6: Commit**

```bash
git add src/features/marketing/WhyAutomate.jsx src/features/marketing/WhyAutomate.css src/App.jsx
git commit -m "feat: WhyAutomate section — 6 pain cards + shift block"
```

---

### Task 4: Day in Your Life timeline

**Files:**
- Create: `src/features/marketing/DayInLife.jsx`
- Create: `src/features/marketing/DayInLife.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create DayInLife.css**

```css
.dil-section { padding: 80px 24px; max-width: 820px; margin: 0 auto; }
.dil-timeline { display: flex; flex-direction: column; gap: 0; margin-top: 40px; }
.dil-item { display: flex; gap: 20px; }
.dil-time-col { display: flex; flex-direction: column; align-items: center; min-width: 72px; }
.dil-time { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--teal); font-weight: 600; white-space: nowrap; padding-top: 16px; }
.dil-line { flex: 1; width: 2px; background: var(--border); margin-top: 8px; min-height: 40px; }
.dil-card { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 16px; cursor: pointer; }
.dil-card-header { display: flex; align-items: center; gap: 14px; }
.dil-card-icon { font-size: 1.5rem; }
.dil-moment { font-weight: 700; font-size: 0.95rem; color: var(--fg); }
.dil-tagline { font-size: 0.8rem; color: var(--muted); margin-top: 2px; }
.dil-chevron { color: var(--muted); font-size: 0.9rem; margin-left: auto; transition: transform 0.2s; }
.dil-card.open .dil-chevron { transform: rotate(180deg); }
.dil-body { display: none; margin-top: 16px; }
.dil-card.open .dil-body { display: block; }
.dil-before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dil-ba-label { font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
.dil-ba-label.before { color: #F43F5E; }
.dil-ba-label.after { color: var(--teal); }
.dil-before-after p { font-size: 0.82rem; color: var(--muted); line-height: 1.65; margin: 0; }
.dil-devices { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.dil-device { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; padding: 4px 10px; font-size: 0.75rem; color: var(--muted); }

@media (max-width: 520px) {
  .dil-before-after { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Create DayInLife.jsx**

```jsx
import { useState } from 'react';
import './DayInLife.css';

const TIMELINE = [
  {
    time: '6:30 AM',
    icon: '🌅',
    moment: 'Waking Up',
    tagline: 'Your home wakes up before you do.',
    before: 'Alarm blares. You fumble for your phone in a dark room. Drag yourself to the bathroom. Realise the geyser is cold — you forgot to turn it on 20 minutes ago. Start the day frazzled.',
    after: 'Your alarm triggers a "Good Morning" scene. Bedroom lights slowly brighten to cool white. The geyser switches on automatically. By the time you\'re brushed and ready, your hot water is waiting. The kitchen light is already on.',
    devices: [
      { icon: '💡', label: 'Tunable white lights — gradual bright wake-up' },
      { icon: '🚿', label: 'Smart geyser — auto-on 20 mins before alarm' },
      { icon: '🎵', label: 'Smart speaker — plays your morning playlist' },
    ],
  },
  {
    time: '8:00 AM',
    icon: '🚪',
    moment: 'Leaving for Work',
    tagline: 'One tap. Everything off. Everything secure.',
    before: 'You\'re running late. Did you turn off the kitchen lights? Is the geyser still on? You can\'t remember. You\'re already in the lift. You go back up to check.',
    after: 'Tap "I\'m Leaving" on your phone. Every non-essential device switches off — lights, fans, geyser, sockets. The front door locks automatically. You get a confirmation on your phone before you\'ve even reached the ground floor.',
    devices: [
      { icon: '🔒', label: 'Smart lock — auto-lock on leaving' },
      { icon: '💡', label: 'All lights — off via leaving scene' },
      { icon: '🔌', label: 'Smart sockets — non-essential loads cut' },
    ],
  },
  {
    time: '10:00 PM',
    icon: '🌙',
    moment: 'Going to Bed',
    tagline: 'One scene. Perfect conditions. Every night.',
    before: 'Room-to-room. Kitchen lights. Hall light. AC on. Fans on. Geyser off. Did you lock the door? Check the door. Back to bed. Still too bright.',
    after: 'Tap "Good Night". Every light turns off. Bedroom fan slows to sleep speed. AC sets to 24°C. Door locks. Cameras arm. You\'re asleep in minutes.',
    devices: [
      { icon: '❄️', label: 'AC — auto-set to sleep temp' },
      { icon: '💨', label: 'BLDC fan — low-speed sleep mode' },
      { icon: '📷', label: 'Cameras — arm on Good Night scene' },
    ],
  },
];

export default function DayInLife() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section id="journey" className="dil-section">
      <div className="section-eyebrow" style={{ color: 'var(--teal)' }}>A day in your life — with Aerlyn</div>
      <h2 className="section-title">See how automation changes<br />every part of your day.</h2>
      <p className="section-body">
        From the moment your alarm goes off to the moment you fall asleep — your home handles
        everything so you don't have to.
      </p>

      <div className="dil-timeline">
        {TIMELINE.map((item, i) => (
          <div key={item.time} className="dil-item">
            <div className="dil-time-col">
              <div className="dil-time">{item.time}</div>
              {i < TIMELINE.length - 1 && <div className="dil-line" />}
            </div>
            <div className={`dil-card${openIndex === i ? ' open' : ''}`} onClick={() => toggle(i)}>
              <div className="dil-card-header">
                <span className="dil-card-icon">{item.icon}</span>
                <div>
                  <div className="dil-moment">{item.moment}</div>
                  <div className="dil-tagline">{item.tagline}</div>
                </div>
                <span className="dil-chevron">▾</span>
              </div>
              <div className="dil-body">
                <div className="dil-before-after">
                  <div>
                    <div className="dil-ba-label before">Without Aerlyn</div>
                    <p>{item.before}</p>
                  </div>
                  <div>
                    <div className="dil-ba-label after">With Aerlyn</div>
                    <p>{item.after}</p>
                  </div>
                </div>
                <div className="dil-devices">
                  {item.devices.map((d) => (
                    <div key={d.label} className="dil-device">
                      <span>{d.icon}</span>
                      <span>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add to App.jsx** (after WhyAutomate, before planner):

```jsx
import DayInLife from './features/marketing/DayInLife.jsx';
<DayInLife />
```

- [ ] **Step 4: Run dev server — verify timeline**

1. 3 timeline cards visible with time stamps
2. Click card — expands with before/after + devices
3. Click again — collapses
4. Only one card open at a time

- [ ] **Step 5: Run all tests**

```
npm test
```

- [ ] **Step 6: Commit**

```bash
git add src/features/marketing/DayInLife.jsx src/features/marketing/DayInLife.css src/App.jsx
git commit -m "feat: DayInLife timeline — 3 expandable cards with before/after"
```

---

### Task 5: Planner section anchor + How it Works

**Files:**
- Create: `src/features/marketing/HowItWorks.jsx`
- Create: `src/features/marketing/HowItWorks.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add `id="planner"` wrapper to existing app in App.jsx**

Wrap the existing `<HomeTypePicker>` + `<RoomList>` + `<ExportPanel>` etc. in a section:

```jsx
<section id="planner" style={{ padding: '80px 0 40px' }}>
  {/* existing planner content */}
</section>
```

- [ ] **Step 2: Create HowItWorks.css**

```css
.how-section { padding: 80px 24px; max-width: 960px; margin: 0 auto; }
.how-steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; }
.how-step { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
.how-step-num { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: var(--teal); font-weight: 600; letter-spacing: 2px; margin-bottom: 10px; }
.how-step-title { font-weight: 700; font-size: 1rem; color: var(--fg); margin-bottom: 8px; }
.how-step-body { font-size: 0.82rem; color: var(--muted); line-height: 1.65; }
```

- [ ] **Step 3: Create HowItWorks.jsx**

```jsx
import './HowItWorks.css';

const STEPS = [
  {
    num: '01 — Understand',
    title: 'Use the planner above',
    body: 'Build your room-by-room requirements. Understand why each solution matters. Share it with our team — or just tell us what problems you want to solve.',
  },
  {
    num: '02 — Visit',
    title: 'Free home assessment',
    body: 'Our expert visits your home at no cost. They assess your wiring, confirm compatibility, refine your requirements, and design the optimal solution for your specific home.',
  },
  {
    num: '03 — Install',
    title: 'Done in under a day',
    body: 'Certified technicians install everything cleanly. No civil work. No damage to walls. No hassle. Typically complete in 4–8 hours for a full home.',
  },
  {
    num: '04 — Live',
    title: 'Your home takes over',
    body: 'One app. Voice commands. Scenes. Schedules. Energy monitoring. And we stay on call — for anything, anytime. Your home gets smarter the longer you use it.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="how-section">
      <div className="section-eyebrow" style={{ color: 'var(--amber, #F59E0B)' }}>From plan to smart home</div>
      <h2 className="section-title">Four steps to a home<br />that works for you.</h2>
      <div className="how-steps">
        {STEPS.map((s) => (
          <div key={s.num} className="how-step">
            <div className="how-step-num">{s.num}</div>
            <div className="how-step-title">{s.title}</div>
            <div className="how-step-body">{s.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add to App.jsx** (after planner section):

```jsx
import HowItWorks from './features/marketing/HowItWorks.jsx';
<HowItWorks />
```

- [ ] **Step 5: Run dev server — verify How it Works + planner anchor**

1. Nav "Planner" link scrolls to the existing planner
2. Nav "How it Works" scrolls to 4-step section
3. 4 step cards render correctly

- [ ] **Step 6: Run all tests**

```
npm test
```

- [ ] **Step 7: Commit**

```bash
git add src/features/marketing/HowItWorks.jsx src/features/marketing/HowItWorks.css src/App.jsx
git commit -m "feat: HowItWorks 4-step section + planner anchor id"
```

---

### Task 6: Contact CTA + Lead Modal

**Files:**
- Create: `src/features/marketing/ContactCTA.jsx`
- Create: `src/features/marketing/ContactCTA.css`
- Create: `src/features/marketing/LeadModal.jsx`
- Create: `src/features/marketing/LeadModal.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ContactCTA.css**

```css
.contact-section { padding: 80px 24px 60px; }
.contact-box { max-width: 600px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 48px 40px; text-align: center; }
.contact-eyebrow { font-size: 0.7rem; letter-spacing: 4px; text-transform: uppercase; color: var(--teal); font-weight: 600; margin-bottom: 14px; }
.contact-title { font-family: 'DM Serif Display', serif; font-size: clamp(1.6rem, 3.5vw, 2.4rem); letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 12px; }
.contact-title em { color: var(--teal); font-style: italic; }
.contact-body-text { font-size: 0.9rem; color: var(--muted); line-height: 1.7; max-width: 440px; margin: 0 auto 28px; }
.contact-form { display: flex; gap: 10px; max-width: 380px; margin: 0 auto; }
.contact-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; color: var(--fg); font-size: 0.9rem; outline: none; }
.contact-input:focus { border-color: var(--teal); }
.contact-submit { background: var(--teal); color: #000; border: none; border-radius: 10px; padding: 12px 20px; font-weight: 700; font-size: 0.88rem; cursor: pointer; white-space: nowrap; }

.site-footer { text-align: center; padding: 24px; color: var(--muted); font-size: 0.78rem; border-top: 1px solid var(--border); }

@media (max-width: 480px) {
  .contact-box { padding: 32px 20px; }
  .contact-form { flex-direction: column; }
}
```

- [ ] **Step 2: Create LeadModal.css**

```css
.lead-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
.lead-modal { background: var(--bg, #080810); border: 1px solid var(--border); border-radius: 18px; padding: 32px; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; }
.lead-modal h3 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: var(--fg); margin: 0 0 6px; }
.lead-modal-sub { font-size: 0.82rem; color: var(--muted); margin: 0 0 20px; }
.lead-modal-preview { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 16px; font-size: 0.8rem; color: var(--muted); }
.lead-form { display: flex; flex-direction: column; gap: 10px; }
.lead-input { background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--fg); font-size: 0.9rem; outline: none; font-family: inherit; resize: vertical; }
.lead-input:focus { border-color: var(--teal); }
.lead-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
.lead-cancel { background: none; border: 1px solid var(--border); color: var(--muted); border-radius: 10px; padding: 10px 18px; cursor: pointer; font-size: 0.88rem; }
.lead-submit { background: var(--teal); color: #000; border: none; border-radius: 10px; padding: 10px 24px; font-weight: 700; font-size: 0.88rem; cursor: pointer; }
.lead-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.lead-success { text-align: center; padding: 16px 0; color: var(--teal); font-weight: 600; font-size: 0.95rem; }
```

- [ ] **Step 3: Create LeadModal.jsx**

```jsx
import { useState } from 'react';
import './LeadModal.css';

const FORMSPREE = 'https://formspree.io/f/mykokrdw'; // swap before launch

export default function LeadModal({ phone: initialPhone, onClose }) {
  const [form, setForm] = useState({
    name: '',
    phone: initialPhone || '',
    city: '',
    propertyType: '',
    timeline: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    setSubmitting(true);
    try {
      await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: form.name,
          Phone: form.phone,
          City: form.city,
          'Property Type': form.propertyType,
          Timeline: form.timeline,
          Notes: form.notes,
          _subject: `New Home Visit Request — ${form.name} (${form.phone})`,
        }),
      });
      setSuccess(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="lead-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lead-modal">
        <h3>Book your free home visit</h3>
        <p className="lead-modal-sub">We'll call you to schedule. No obligation.</p>
        {success ? (
          <div className="lead-success">
            ✓ Request received! We'll call you within 24 hours.
            <br />
            <button type="button" onClick={onClose} style={{ marginTop: 16, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
              Close
            </button>
          </div>
        ) : (
          <div className="lead-form">
            <input type="text" className="lead-input" placeholder="Your name *" value={form.name} onChange={(e) => set('name', e.target.value)} />
            <input type="text" className="lead-input" placeholder="Phone number *" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <input type="text" className="lead-input" placeholder="City / Area" value={form.city} onChange={(e) => set('city', e.target.value)} />
            <select className="lead-input" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
              <option value="" disabled>Property type</option>
              <option>1BHK Apartment</option>
              <option>2BHK Apartment</option>
              <option>3BHK Apartment</option>
              <option>4BHK+ Apartment</option>
              <option>Independent House / Villa</option>
              <option>Office / Commercial</option>
              <option>Under construction</option>
            </select>
            <select className="lead-input" value={form.timeline} onChange={(e) => set('timeline', e.target.value)}>
              <option value="" disabled>When are you looking to automate?</option>
              <option>As soon as possible</option>
              <option>Within a month</option>
              <option>1–3 months</option>
              <option>Just exploring</option>
            </select>
            <textarea className="lead-input" rows={3} placeholder="Any specific problems or questions?" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            <div className="lead-modal-actions">
              <button type="button" className="lead-cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="lead-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Sending…' : 'Book free visit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ContactCTA.jsx**

```jsx
import { useState } from 'react';
import LeadModal from './LeadModal.jsx';
import './ContactCTA.css';

export default function ContactCTA() {
  const [phone, setPhone] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section id="contact" className="contact-section">
        <div className="contact-box">
          <div className="contact-eyebrow">The first step is free</div>
          <h2 className="contact-title">Your intelligent home<br />starts with <em>one visit.</em></h2>
          <p className="contact-body-text">
            Book a free home consultation. Our expert comes to you, reviews your requirements, and
            designs a solution that fits your home, your lifestyle, and your budget. Completely free.
            Zero obligation.
          </p>
          <div className="contact-form">
            <input
              type="text"
              className="contact-input"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button type="button" className="contact-submit" onClick={() => setModalOpen(true)}>
              Book free visit
            </button>
          </div>
        </div>
        <footer className="site-footer">
          © {new Date().getFullYear()} Aerlyn. All rights reserved.
        </footer>
      </section>
      {modalOpen && <LeadModal phone={phone} onClose={() => setModalOpen(false)} />}
    </>
  );
}
```

- [ ] **Step 5: Add to App.jsx** (after HowItWorks, at the very bottom):

```jsx
import ContactCTA from './features/marketing/ContactCTA.jsx';
<ContactCTA />
```

- [ ] **Step 6: Run dev server — test full page and lead modal**

1. Scroll to Contact section — phone input + "Book free visit" button
2. Enter phone number, click button — modal opens with phone pre-filled
3. Fill required fields (name + phone), click "Book free visit"
4. Success message appears
5. Click overlay — modal closes
6. Mobile layout — form stacks vertically

- [ ] **Step 7: Run all tests**

```
npm test
```

- [ ] **Step 8: Run build — confirm clean**

```
npm run build
```

- [ ] **Step 9: Tag + update HANDOFF**

```bash
git tag feature-d-marketing-complete
```

Update `docs/HANDOFF.md` — mark Feature D complete.

- [ ] **Step 10: Commit**

```bash
git add src/features/marketing/ src/App.jsx docs/HANDOFF.md
git commit -m "feat: ContactCTA + LeadModal — Formspree lead capture — feature-d-marketing-complete"
```

---

## Launch checklist (not a feature task — do before going live)

- [ ] Swap Formspree endpoint in `src/features/marketing/LeadModal.jsx` line ~8: replace `mykokrdw` with production endpoint
- [ ] Run `npm run build` — confirm `dist/` is clean
- [ ] Deploy `dist/` to static host
- [ ] Smoke-test lead modal on production — verify submission arrives in Formspree dashboard
