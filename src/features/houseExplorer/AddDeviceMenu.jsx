import { useState } from 'react';
import { DEVICES } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';

export default function AddDeviceMenu({ roomId, presentIds }) {
  const { dispatch, actions } = useHome();
  const [value, setValue] = useState('');
  const available = DEVICES.filter((d) => !presentIds.includes(d.id));

  function onChange(e) {
    const id = e.target.value;
    if (!id) return;
    dispatch(actions.addDevice(roomId, id));
    setValue('');
  }

  if (available.length === 0) {
    return <div className="add-device device-cat">All devices added.</div>;
  }

  return (
    <div className="add-device">
      <select value={value} onChange={onChange}>
        <option value="">+ Add a device…</option>
        {available.map((d) => (
          <option key={d.id} value={d.id}>
            {d.icon} {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}
