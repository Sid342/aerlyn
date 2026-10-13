import { MATERIAL_COLORS } from '../../../data/plateAccessories.js';

export default function StepMaterial({ config, onChange }) {
  return (
    <div>
      <div className="tpd-section-label">Choose colour</div>
      <div className="tpd-color-grid">
        {MATERIAL_COLORS.map((c) => (
          <div key={c.label} style={{ textAlign: 'center' }}>
            <button
              type="button"
              aria-label={c.label}
              aria-pressed={config.material === c.label}
              className={`tpd-color-swatch${config.material === c.label ? ' selected' : ''}`}
              style={{ background: c.code, boxShadow: c.code === '#ffffff' ? '0 0 0 1px var(--border)' : 'none' }}
              onClick={() => onChange({ ...config, material: c.label, materialCode: c.code })}
            />
            <div className="tpd-color-label" aria-hidden="true">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
