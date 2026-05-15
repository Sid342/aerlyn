const SIZE_OPTIONS = [
  { label: 'Standard', sub: '86 × 86 mm' },
  { label: 'Slim', sub: '86 × 50 mm' },
];

export default function StepSize({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose plate profile</div>
      <div className="tpd-option-grid">
        {SIZE_OPTIONS.map((s) => (
          <div
            key={s.label}
            className={`tpd-option${config.size === s.label ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, size: s.label })}
          >
            <div className="tpd-option-label">{s.label}</div>
            <div className="tpd-option-sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
