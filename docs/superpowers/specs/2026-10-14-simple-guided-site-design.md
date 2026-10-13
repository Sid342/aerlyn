# Simpler, guided site — design

**Date:** 2026-10-14
**Branch:** `redesign/simple-guided`
**Owner feedback being answered:** "the entire website is too wordy and too difficult to use", "it also looks too AI in terms of the text", "make it easier to navigate and do things".

## Measured starting point (home page, `main` @ 73eb6bb)

| | Now |
|---|---|
| Words before the visitor does anything | 1,429 |
| Words between the headline and the planner | 906 |
| Planner position | 4th section |
| Device rows shown at once after picking 2BHK | 64 (about 316 controls) |
| Tools stacked on the one page | planner, scene builder, 8-step plate designer |
| Button wordings for the same two actions | 5 |
| Fields in the appointment form | 6 |
| Long dashes in the copy | 33 |

## Goals

1. A visitor gets a plan and books an appointment in under a minute, with two taps and one multi-select.
2. Home page copy is about 400 words, plain, with no slogan patterns.
3. From any screen it is obvious where you are, what the next step is, and how to go back.

## Non-goals

Prices, online selling, accounts, analytics. New photography (owner to supply later). Changing the plate designer's drawing or catalogue.

## Decisions taken by default (owner may overrule)

| Question | Default |
|---|---|
| Is the plate designer for customers? | Yes, but optional and on its own page, offered after the plan exists. |
| Custom scene builder | Moves behind "Customise". The three preset scenes stay as a one-tap demo. |
| Goal tiles in question 2 | Lighting · Fans & AC · Curtains · Security · Geyser & energy · Voice & music |
| Unverified claims | Hero stats stay (owner approved). "certified technicians", "65% less power", "India's Most Comprehensive", "4–8 hours" are dropped until confirmed. |
| Specifics (city, brands, photos, testimonials) | Not invented. Config gains optional fields; sections that need them render only when filled. |

## 1. Navigation

**Header (every page, identical):** logo · Plan my home · How it works · Products · FAQ · **Book an appointment** (button). "Why Automate" and "Contact" leave the nav; the appointment button replaces Contact.

**Mobile:** same items in the menu; one sticky button at the bottom of the screen — "Plan my home" until a plan exists, then "Book an appointment".

**Two button wordings site-wide:** "Plan my home" and "Book an appointment". Nothing else for those two actions.

**Routes**

| Path | Page |
|---|---|
| `/` | Home with the guided planner directly under the hero |
| `/plate-designer.html` | Plate designer (moved off the home page) |
| `/products/retrofit-1-switch.html`, `/products/retrofit-2-switch.html` | Unchanged (Play Store URLs) |
| `/privacy-policy.html`, `/terms.html` | Unchanged |

**Wayfinding rules**
- The planner shows its steps as "1 Your home · 2 What you want · 3 Your plan", with Back and Next in one fixed place at the top, as the plate designer already does.
- Every finished action says what happens next ("We'll call you within a day to fix a time") and offers one next step. No dead ends.
- Reloading or returning keeps the visitor on the step they left.
- Tap targets are at least 44 px; focus is visible; the whole flow works by keyboard.

## 2. Guided planner

Replaces the always-open editor as the default experience. The existing reducer, switch planner, lead payload, plan link and PDF are reused unchanged.

**Step 1 — Your home.** Four large tiles: 1BHK, 2BHK, 3BHK, Villa.

**Step 2 — What you want.** Six goal tiles, multi-select, all on by default so "Next" works immediately:

| Tile | Device categories it keeps |
|---|---|
| Lighting | Lighting |
| Fans & AC | Comfort (fan, AC) |
| Curtains | Comfort (curtain) |
| Security | Security |
| Geyser & energy | Water, Energy |
| Voice & music | Control, Audio |

Power sockets and USB points always stay; they are part of any install. Turning a tile off removes those devices from every room (pure function `applyGoals(rooms, goals)`, tested).

**Step 3 — Your plan.** One short card per room in plain words ("Living room — lights, fan, curtains, camera"), no quantities, no switch counts. Above the cards, the actions in this order:
1. **Book an appointment** — name and phone only; city and notes optional. Sends the full plan (quantities and switch plan included) as today.
2. Save or share my plan — link, WhatsApp, PDF.
3. Customise — opens today's detailed editor (rooms, devices, quantities) as a secondary view.
4. See it in action — the three preset scenes lighting up the house drawing.
5. Design a switch plate — link to `/plate-designer.html`, marked optional.

**Hidden from customers, still computed and still sent in the lead:** switch plan, module counts, overrides, plate recommendation, room size. Room size and overrides remain editable inside Customise under an "Installer details" disclosure.

**Removed:** the Build/Play mode toggle (the demo is its own action), the floor-plan upload (never reached anyone and was not sent in leads).

## 3. Copy

**Rules for every line on the site**
- Say it the way it would be said to a customer in the shop. One idea per sentence.
- No "not X, it's Y" reversals, no three-beat fragments, no mirrored slogans, no label above every heading.
- No absolutes ("completely", "permanently", "every single", "zero"). No telling the reader how they feel.
- At most a handful of long dashes on the whole page; use full stops.
- Emoji are not used as icons. Simple line icons or nothing.
- Device names in plain words: Smart fan, Colour-changing strip, Ceiling spotlights, AC control, Colour-temperature lights.

**Home page structure and budget (about 400 words)**

| Section | Content | Words |
|---|---|---|
| Hero | One line saying what Aerlyn does, one supporting line, one button | ~30 |
| Planner | The three steps | ~60 of labels |
| What it does for you | Three one-line pairs (problem → what you get), replacing "Why Automate" and "A day in your life" | ~60 |
| How it works | Four steps, one line each | ~50 |
| Proof | Hero stats (approved); photos, service area, brands, testimonial only when supplied in config | ~30 |
| FAQ | Existing questions, answers trimmed, still collapsed | ~150 |
| Appointment | One line and the button | ~20 |

Product, privacy and terms pages: wording tightened by the same rules; legal meaning unchanged.

## 4. What stays as is

Plate designer internals and PDF, plan link format, lead delivery, validation, prerender and SEO pipeline (the new route is added to the route map, sitemap and head data), Netlify config, the three Play Store URLs.

## 5. Testing and verification

- Unit: `applyGoals`, room-summary sentence builder, route map with the new page, step persistence.
- Build: dist check covers the new page; one `<h1>` per page.
- Copy check as a test over the prerendered home page: word count at most 500 before interaction, long-dash count at most 6, none of the banned phrases.
- Browser: complete the flow start to booking at 360 px and desktop by touch and by keyboard; count taps to reach the appointment form (target: 3 from landing); plan link restores into step 3; Customise edits survive a round trip; plate designer page works from the link and directly.

## 6. Phases

1. **Copy and navigation** — rewrite, new header, unified buttons, sections cut and reordered, planner moved up. Usable on its own.
2. **Guided planner** — steps 1 to 3, goals, plan cards, Customise holding the old editor, installer details hidden.
3. **Tools off the main path** — plate designer to its own page, demo as an action, custom scenes under Customise, removals.

## Needed from the owner (improves the result, does not block)

Service area · install photos · brands fitted · what a visit involves and how long · any real customer feedback · which of the dropped claims are true.

## Addendum — 2026-10-14: planner shortened further

Owner: "even planning is very long and tedious". The three-step planner above is replaced by a one-tap planner. Where this addendum and section 2 disagree, this addendum wins.

- **One question:** "What's your home?" — four tiles. Tapping one shows the plan immediately, on the same screen. No step 2, no Next button, no stepper.
- **Plan view:** one plain line per room. Directly above it, the six goal chips, all on; tapping a chip removes or restores that kind of device everywhere. Changing home type is one tap on the tiles, which stay visible.
- **Primary action, always visible with the plan:** "Book an appointment" — name and phone only.
- **Everything else is one quiet row of links under the plan:** Save or share · Customise · See it in action · Design a switch plate.
- **Target:** two taps from landing to the appointment form (home tile, then the button).
- The wayfinding rule about a planner step indicator in section 1 no longer applies; there are no steps.
