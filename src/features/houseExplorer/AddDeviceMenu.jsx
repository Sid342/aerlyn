import { DEVICES } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import { goalOf } from '../../lib/goals.js';

// Offers what the room does not have yet, from the goals that are switched on above the plan.
export default function AddDeviceMenu({ roomId, presentIds }) {
  const { home, dispatch, actions } = useHome();
  const available = DEVICES.filter((d) => !presentIds.includes(d.id) && (goalOf(d.id) === null || home.goals.includes(goalOf(d.id))));
  if (available.length === 0) return null;

  function onChange(e) {
    if (e.target.value) dispatch(actions.addDevice(roomId, e.target.value));
  }

  return (
    <select className="lead-input add-device" value="" onChange={onChange} aria-label="Add a device">
      <option value="">Add a device…</option>
      {available.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
  );
}
