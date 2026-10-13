export const MODULE_OPTIONS = [
  { label: '2 module', maxSlots: 2 },
  { label: '4 module', maxSlots: 4 },
  { label: '6 module', maxSlots: 6 },
  { label: '8 module', maxSlots: 8 },
  { label: '12 module', maxSlots: 12 },
];

export default function StepModel({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose plate size</div>
      <div className="tpd-option-grid">
        {MODULE_OPTIONS.map((opt) => (
          <button
            type="button"
            aria-pressed={config.model === opt.label}
            key={opt.label}
            className={`tpd-option${config.model === opt.label ? ' selected' : ''}`}
            onClick={() => onChange({ ...config, model: opt.label, maxSlots: opt.maxSlots, accessories: [], icons: {} })}
          >
            <span className="tpd-option-label">{opt.label}</span>
            <span className="tpd-option-sub">{opt.maxSlots} slots</span>
          </button>
        ))}
      </div>
    </div>
  );
}
