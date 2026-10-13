const PANEL_OPTIONS = [
  { label: 'Matte', sub: 'Non-reflective finish' },
  { label: 'Gloss', sub: 'High-shine finish' },
  { label: 'Satin', sub: 'Soft semi-gloss' },
];

export default function StepPanel({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Panel finish</div>
      <div className="tpd-option-grid">
        {PANEL_OPTIONS.map((p) => (
          <button
            type="button"
            aria-pressed={config.panel === p.label}
            key={p.label}
            className={`tpd-option${config.panel === p.label ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, panel: p.label })}
          >
            <span className="tpd-option-label">{p.label}</span>
            <span className="tpd-option-sub">{p.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
