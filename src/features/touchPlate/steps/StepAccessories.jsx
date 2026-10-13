import { ACCESSORIES } from '../../../data/plateAccessories.js';

export default function StepAccessories({ config, onChange }) {
  const available = ACCESSORIES[config.model] || [];
  const totalSlots = config.maxSlots;
  const is12 = config.model === '12 module';

  const slotMap = Array(totalSlots).fill(null);
  config.accessories.forEach((a) => {
    a.slots.forEach((si) => { slotMap[si] = a; });
  });

  const usedSlots = config.accessories.reduce((sum, a) => sum + a.nodeSize, 0);
  const freeSlots = totalSlots - usedSlots;

  function addAccessory(acc) {
    if (acc.nodeSize > freeSlots) return;
    let startSlot = -1;
    outer: for (let i = 0; i <= totalSlots - acc.nodeSize; i++) {
      for (let j = 0; j < acc.nodeSize; j++) {
        if (slotMap[i + j]) continue outer;
      }
      startSlot = i;
      break;
    }
    if (startSlot === -1) return;
    const newAcc = {
      ...acc,
      id: `${acc.name}-${Date.now()}`,
      slots: Array.from({ length: acc.nodeSize }, (_, k) => startSlot + k),
    };
    onChange({ ...config, accessories: [...config.accessories, newAcc] });
  }

  function removeAccessory(id) {
    onChange({ ...config, accessories: config.accessories.filter((a) => a.id !== id) });
  }

  return (
    <div>
      <div className="tpd-section-label">
        Place accessories ({freeSlots} slot{freeSlots !== 1 ? 's' : ''} free)
      </div>

      <div className={`tpd-acc-plate${is12 ? ' two-row' : ''}`}>
        {slotMap.map((slot, i) => (
          <div key={i} className={`tpd-slot${slot ? ' occupied' : ' empty'}`}>
            {slot ? slot.name.split(' ').slice(0, 2).join(' ') : '·'}
          </div>
        ))}
      </div>

      <div className="tpd-section-label" style={{ marginTop: 16 }}>Available</div>
      <div className="tpd-option-grid">
        {available.map((acc) => {
          const disabled = acc.nodeSize > freeSlots;
          return (
            <button
              type="button"
              key={acc.name}
              className="tpd-option"
              disabled={disabled}
              onClick={() => addAccessory(acc)}
            >
              <span className="tpd-option-label">{acc.name}</span>
              <span className="tpd-option-sub">{acc.nodeSize} slot{acc.nodeSize !== 1 ? 's' : ''}</span>
            </button>
          );
        })}
      </div>

      {config.accessories.length > 0 && (
        <>
          <div className="tpd-section-label" style={{ marginTop: 16 }}>Placed</div>
          <div>
            {config.accessories.map((a) => (
              <div key={a.id} className="tpd-placed-row">
                <span>{a.name}</span>
                <button type="button" className="tpd-remove-acc" aria-label={`Remove ${a.name}`} onClick={() => removeAccessory(a.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
