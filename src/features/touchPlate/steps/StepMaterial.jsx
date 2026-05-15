export const MATERIAL_COLORS = [
  { code: '#000000', label: 'Black' },
  { code: '#bfc6cb', label: 'Space Grey' },
  { code: '#f4debe', label: 'Titanium' },
  { code: '#ffffff', label: 'White' },
  { code: '#616161', label: 'Gray' },
];

export default function StepMaterial({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose material / colour</div>
      <div className="tpd-color-grid">
        {MATERIAL_COLORS.map((c) => (
          <div key={c.label} style={{ textAlign: 'center' }}>
            <div
              className={`tpd-color-swatch${config.material === c.label ? ' selected' : ''}`}
              style={{ background: c.code, boxShadow: c.code === '#ffffff' ? '0 0 0 1px var(--border)' : 'none' }}
              onClick={() => onChange({ ...config, material: c.label, materialCode: c.code })}
              title={c.label}
            />
            <div className="tpd-color-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
