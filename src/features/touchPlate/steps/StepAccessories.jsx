import { ACCESSORIES } from '../../../data/plateAccessories.js';
import { findStart, modulesLabel } from '../../../lib/plateLayout.js';

const modules = (n) => `${n} module${n !== 1 ? 's' : ''}`;

export default function StepAccessories({ config, onChange }) {
  const available = ACCESSORIES[config.model] || [];
  const free = config.maxSlots - new Set(config.accessories.flatMap((a) => a.slots)).size;
  const placed = [...config.accessories].sort((a, b) => a.slots[0] - b.slots[0]);

  function add(item) {
    const start = findStart(config, item.nodeSize);
    if (start < 0) return;
    // the id is the first module — stable, short, and unique because modules never overlap
    const placedItem = { ...item, id: `a${start}`, slots: Array.from({ length: item.nodeSize }, (_, k) => start + k) };
    onChange({ ...config, accessories: [...config.accessories, placedItem] });
  }

  function remove(id) {
    onChange({
      ...config,
      accessories: config.accessories.filter((a) => a.id !== id),
      icons: Object.fromEntries(Object.entries(config.icons).filter(([key]) => !key.startsWith(`${id}.`))),
    });
  }

  return (
    <div>
      <div className="tpd-section-label">On this plate ({modules(free)} free)</div>
      {placed.length === 0 ? (
        <p className="tpd-hint">Nothing placed yet. Pick an accessory below and it appears on the plate.</p>
      ) : (
        <ul className="tpd-placed">
          {placed.map((a) => (
            <li key={a.id} className="tpd-placed-row">
              <span>
                <strong>{a.name}</strong>
                <span className="tpd-placed-where">{modulesLabel(a.slots)}</span>
              </span>
              <button type="button" className="tpd-remove-acc" aria-label={`Remove ${a.name}, ${modulesLabel(a.slots)}`} onClick={() => remove(a.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="tpd-section-label">Add an accessory</div>
      <div className="tpd-option-grid">
        {available.map((item) => (
          <button
            type="button"
            key={item.name}
            className="tpd-option"
            disabled={findStart(config, item.nodeSize) < 0}
            onClick={() => add(item)}
          >
            <span className="tpd-option-label">{item.name}</span>
            <span className="tpd-option-sub">{modules(item.nodeSize)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
