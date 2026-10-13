import { plateLayout, plateSummary } from '../../lib/plateLayout.js';
import { SYMBOLS, placeSymbol } from '../../data/plateIcons.js';

const pathOf = (s) => `M${s.pts.map((p) => p.join(' ')).join('L')}${s.closed ? 'Z' : ''}`;

export function Shapes({ shapes }) {
  return shapes.map((s, i) =>
    s.c ? <circle key={i} cx={s.c[0]} cy={s.c[1]} r={s.c[2]} /> : <path key={i} d={pathOf(s)} />
  );
}

// A symbol on its own, for pickers. Decorative — the button it sits in carries the name.
export function PlateIcon({ id }) {
  return (
    <svg className="tpd-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <Shapes shapes={SYMBOLS[id]} />
    </svg>
  );
}

const SHEEN = { Gloss: 0.42, Satin: 0.16 };
const EDGE = 1; // room around the plate for its outline
const pct = (n) => `${+(n * 100).toFixed(3)}%`;

// The plate, drawn from plateLayout. With onSelect, each switch button gets a real <button> on top of it.
export default function PlatePreview({ config, idPrefix = 'plate', selected, onSelect }) {
  const layout = plateLayout(config);
  if (!layout) return <p className="tpd-plate-none">Choose a plate size to see your plate here.</p>;

  const { w, h, fill, ink, line, button, radius, bezel } = layout;
  const sheen = SHEEN[config.panel];
  const sheenId = `${idPrefix}-sheen`;
  const switches = layout.controls.filter((c) => c.kind === 'switch');

  return (
    <div className="tpd-plate" style={{ maxWidth: w * 8 }}>
      <svg viewBox={`${-EDGE} ${-EDGE} ${w + 2 * EDGE} ${h + 2 * EDGE}`} role="img" aria-label={plateSummary(config)}>
        {sheen && (
          <defs>
            <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={sheen} />
              <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.6" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity={sheen * 0.45} />
            </linearGradient>
          </defs>
        )}
        <rect width={w} height={h} rx={radius} fill={fill} stroke={line} strokeWidth={bezel ? 0.5 : 0.2} />
        {sheen && <rect width={w} height={h} rx={radius} fill={`url(#${sheenId})`} />}
        {bezel && (
          <rect x="1.3" y="1.3" width={w - 2.6} height={h - 2.6} rx={Math.max(0, radius - 1.1)}
            fill="none" stroke={line} strokeWidth="0.25" opacity="0.7" />
        )}
        {layout.empty.map((m) => (
          <rect key={`${m.x}-${m.y}`} x={m.x + 1} y={m.y + 1} width={m.w - 2} height={m.h - 2} rx="1"
            fill="none" stroke={line} strokeWidth="0.3" strokeDasharray="1.2 1.2" opacity="0.75" />
        ))}
        {layout.controls.map((c) => {
          const { button: b, symbol: s } = c;
          const on = onSelect && c.key === selected;
          return (
            <g key={`${c.x}-${c.y}`}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.r}
                fill={button} stroke={on ? 'var(--teal)' : line} strokeWidth={on ? 0.7 : 0.3} />
              <g fill="none" stroke={ink} strokeWidth={s.stroke} strokeLinecap="round" strokeLinejoin="round">
                <Shapes shapes={placeSymbol(s.name, s.cx, s.cy, s.size)} />
              </g>
              {onSelect && c.kind === 'switch' && (
                <text x={b.x + b.w * 0.09} y={b.y + Math.min(2.3, b.w * 0.36)} fontSize={Math.min(1.9, b.w * 0.3)} fill={ink} opacity="0.7">{c.n}</text>
              )}
            </g>
          );
        })}
      </svg>
      {onSelect && switches.map((c) => (
        <button
          type="button"
          key={c.key}
          className="tpd-hit"
          aria-label={`Switch ${c.n}`}
          aria-pressed={c.key === selected}
          style={{
            left: pct((c.x + EDGE) / (w + 2 * EDGE)), top: pct((c.y + EDGE) / (h + 2 * EDGE)),
            width: pct(c.w / (w + 2 * EDGE)), height: pct(c.h / (h + 2 * EDGE)),
          }}
          onClick={() => onSelect(c.key)}
        />
      ))}
    </div>
  );
}
