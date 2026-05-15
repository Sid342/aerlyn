export const ACCESSORIES = {
  '2 module': [
    { id: '2-switch-1-25a', name: '2 Switch (1-25A)', nodeSize: 1 },
    { id: '4-switch', name: '4 Switch', nodeSize: 2 },
    { id: 'fan', name: 'Fan', nodeSize: 2 },
    { id: '2-switch-1-curtain', name: '2 Switch 1 Curtain', nodeSize: 2 },
    { id: '1-curtain', name: '1 Curtain', nodeSize: 2 },
    { id: 'socket-10a', name: 'Socket 10A', nodeSize: 2 },
    { id: 'socket-16a', name: 'Socket 16A', nodeSize: 2 },
  ],
  '4 module': [
    { id: '4-switch', name: '4 Switch', nodeSize: 2 },
    { id: '2-switch-1-socket-1-10a', name: '2 Switch 1 Socket (1-10A)', nodeSize: 3 },
    { id: '2-switch-1-fan-1-25a', name: '2 Switch 1 Fan (1-25A)', nodeSize: 3 },
    { id: '4-switch-1-curtain', name: '4 Switch 1 Curtain', nodeSize: 3 },
    { id: '6-switch-1-curtain', name: '6 Switch 1 Curtain', nodeSize: 4 },
    { id: '4-switch-1-socket-1-10a', name: '4 Switch 1 Socket (1-10A)', nodeSize: 4 },
    { id: 'fan-1-socket-1-10a', name: 'Fan 1 Socket (1-10A)', nodeSize: 4 },
    { id: '2-switch-1-fan-1-curtain', name: '2 Switch 1 Fan 1 Curtain', nodeSize: 4 },
    { id: '4-switch-1-fan', name: '4 Switch + 1 Fan', nodeSize: 4 },
    { id: '2-fan', name: '2 Fan', nodeSize: 4 },
    { id: '6-switch-1-20a', name: '6 Switch (1-20A)', nodeSize: 3 },
    { id: '8-switch-1-20a', name: '8 Switch (1-20A)', nodeSize: 4 },
  ],
  '6 module': [
    { id: '6-switch-1-20a', name: '6 Switch (1-20A)', nodeSize: 3 },
    { id: '8-switch-1-20a', name: '8 Switch (1-20A)', nodeSize: 4 },
    { id: '10-switch-2-20a', name: '10 Switch (2-20A)', nodeSize: 5 },
    { id: '6-switch-1-fan', name: '6 Switch 1 Fan', nodeSize: 5 },
    { id: '8-switch-1-fan', name: '8 Switch 1 Fan', nodeSize: 6 },
    { id: '2-switch-1-fan-1-socket-1-10a', name: '2 Switch 1 Fan 1 Socket (1-10A)', nodeSize: 5 },
    { id: '6-switch-1-socket-1-10a', name: '6 Switch 1 Socket (1-10A)', nodeSize: 5 },
    { id: '2-switch-2-socket-2-10a', name: '2 Switch 2 Socket (2-10A)', nodeSize: 5 },
    { id: '8-switch-1-curtain', name: '8 Switch 1 Curtain', nodeSize: 5 },
    { id: '4-switch-1-fan-1-curtain', name: '4 Switch 1 Fan 1 Curtain', nodeSize: 5 },
    { id: '4-switch-2-fan', name: '4 Switch + 2 Fan', nodeSize: 6 },
    { id: '4-switch-1-fan-1-socket-1-10a', name: '4 Switch 1 Fan 1 Socket (1-10A)', nodeSize: 6 },
    { id: '8-switch-1-socket-1-10a', name: '8 Switch 1 Socket (1-10A)', nodeSize: 6 },
    { id: '4-switch-2-socket-2-10a', name: '4 Switch 2 Socket (2-10A)', nodeSize: 6 },
    { id: '6-switch-1-socket-1-curtain', name: '6 Switch 1 Socket 1 Curtain', nodeSize: 6 },
  ],
  '8 module': [
    { id: '8-switch-1-fan', name: '8 Switch 1 Fan', nodeSize: 6 },
    { id: '4-switch-2-fan-1-socket', name: '4 Switch 2 Fan 1 Socket', nodeSize: 8 },
    { id: '6-switch-1-fan-1-socket', name: '6 Switch 1 Fan 1 Socket', nodeSize: 7 },
    { id: '8-switch-1-fan-1-socket', name: '8 Switch 1 Fan 1 Socket', nodeSize: 7 },
    { id: '8-switch-1-curtain-1-socket', name: '8 Switch 1 Curtain 1 Socket', nodeSize: 7 },
    { id: '4-switch-1-fan-1-curtain-1-socket', name: '4 Switch 1 Fan 1 Curtain 1 Socket', nodeSize: 7 },
    { id: '8-switch-1-socket', name: '8 Switch 1 Socket', nodeSize: 7 },
    { id: '10-switch-1-socket', name: '10 Switch 1 Socket', nodeSize: 7 },
    { id: '4-switch-2-fan', name: '4 Switch + 2 Fan', nodeSize: 6 },
    { id: '6-switch-1-fan', name: '6 Switch 1 Fan', nodeSize: 5 },
    { id: '10-switch-2-20a', name: '10 Switch (2-20A)', nodeSize: 5 },
    { id: '4-switch-1-fan-1-curtain', name: '4 Switch 1 Fan 1 Curtain', nodeSize: 5 },
    { id: '8-switch-1-curtain', name: '8 Switch 1 Curtain', nodeSize: 5 },
  ],
  '12 module': [
    { id: '12-switch-2-fan', name: '12 Switch 2 Fan', nodeSize: 5 },
    { id: '20-switch-4-20a', name: '20 Switch (4-20A)', nodeSize: 5 },
    { id: '14-switch-2-fan', name: '14 Switch 2 Fan', nodeSize: 5 },
    { id: '8-switch-4-fan', name: '8 Switch 4 Fan', nodeSize: 5 },
  ],
};

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
            <div
              key={acc.name}
              className={`tpd-option${disabled ? ' disabled' : ''}`}
              onClick={() => !disabled && addAccessory(acc)}
            >
              <div className="tpd-option-label">{acc.name}</div>
              <div className="tpd-option-sub">{acc.nodeSize} slot{acc.nodeSize !== 1 ? 's' : ''}</div>
            </div>
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
                <button type="button" className="tpd-remove-acc" onClick={() => removeAccessory(a.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
