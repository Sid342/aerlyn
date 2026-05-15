const FRAME_OPTIONS = [
  { label: 'Square', sub: 'Sharp 90° edges' },
  { label: 'Rounded', sub: '4 mm corner radius' },
  { label: 'Minimal', sub: 'Flush, no bezel' },
];

export default function StepFrame({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Frame style</div>
      <div className="tpd-option-grid">
        {FRAME_OPTIONS.map((f) => (
          <div
            key={f.label}
            className={`tpd-option${config.frame === f.label ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, frame: f.label })}
          >
            <div className="tpd-option-label">{f.label}</div>
            <div className="tpd-option-sub">{f.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
