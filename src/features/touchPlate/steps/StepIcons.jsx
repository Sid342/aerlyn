import { PLATE_ICONS, iconLabel } from '../../../data/plateIcons.js';
import { PlateIcon } from '../PlatePreview.jsx';

// `switches` are the plate's switch buttons from plateLayout; `selected` is the key of the one being edited.
export default function StepIcons({ config, onChange, switches, selected, onSelect }) {
  const current = switches.find((c) => c.key === selected);
  if (!current) return null;

  function setIcon(id) {
    const icons = { ...config.icons };
    if (id) icons[current.key] = id;
    else delete icons[current.key];
    onChange({ ...config, icons });
  }

  return (
    <div>
      <div className="tpd-section-label">Pick a button</div>
      <div className="tpd-chip-row">
        {switches.map((c) => (
          <button
            type="button"
            key={c.key}
            className={`tpd-chip${c.key === current.key ? ' selected' : ''}`}
            aria-pressed={c.key === current.key}
            onClick={() => onSelect(c.key)}
          >
            Switch {c.n}{c.icon && <span className="tpd-chip-icon"> · {iconLabel(c.icon)}</span>}
          </button>
        ))}
      </div>

      <div className="tpd-section-label">Icon for Switch {current.n}</div>
      <div className="tpd-icon-grid">
        {[{ id: null, label: 'Default' }, ...PLATE_ICONS].map((icon) => (
          <button
            type="button"
            key={icon.label}
            className={`tpd-icon-btn${current.icon === icon.id ? ' selected' : ''}`}
            aria-pressed={current.icon === icon.id}
            onClick={() => setIcon(icon.id)}
          >
            <PlateIcon id={icon.id || 'switch'} />
            <span>{icon.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
