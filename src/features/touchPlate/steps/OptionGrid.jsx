// One choice out of a short list of { label, sub? } options.
export default function OptionGrid({ title, options, value, onPick }) {
  return (
    <div>
      <div className="tpd-section-label">{title}</div>
      <div className="tpd-option-grid">
        {options.map((o) => (
          <button
            type="button"
            aria-pressed={value === o.label}
            key={o.label}
            className={`tpd-option${value === o.label ? ' selected' : ''}`}
            onClick={() => onPick(o)}
          >
            <span className="tpd-option-label">{o.label}</span>
            {o.sub && <span className="tpd-option-sub">{o.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
