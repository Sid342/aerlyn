// Limits on the home page copy, checked against the prerendered HTML at build time.
export const COPY_LIMITS = { words: 500, longDashes: 6 };
export const BANNED_PHRASES = [
  "isn't a luxury", 'working against you', 'every single', 'completely', 'permanently',
  'zero obligation', 'seamless', 'effortless',
];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' };

// The text a visitor can read before doing anything: the body without scripts, styles and tags.
export function visibleText(html) {
  const body = html.slice(html.indexOf('<body'));
  return body
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&(amp|lt|gt|quot|nbsp);/g, (_, name) => ENTITIES[name])
    .replace(/\s+/g, ' ')
    .trim();
}

// Problems with the copy of one prerendered page, as readable strings. Empty when it passes.
export function copyProblems(html) {
  const text = visibleText(html);
  const words = text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  const dashes = (html.match(/—/g) || []).length;
  const lower = text.toLowerCase().replace(/’/g, "'");
  const emoji = text.match(/\p{Emoji_Presentation}|️/u);
  return [
    words > COPY_LIMITS.words && `${words} words before interaction (limit ${COPY_LIMITS.words})`,
    dashes > COPY_LIMITS.longDashes && `${dashes} long dashes (limit ${COPY_LIMITS.longDashes})`,
    ...BANNED_PHRASES.filter((p) => lower.includes(p)).map((p) => `banned phrase "${p}"`),
    emoji && `emoji in visible text: ${emoji[0]}`,
  ].filter(Boolean);
}

export function copyStats(html) {
  const text = visibleText(html);
  return {
    words: text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length,
    longDashes: (html.match(/—/g) || []).length,
  };
}
