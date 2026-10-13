import { getDevice } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import DeviceInfo from './DeviceInfo.jsx';

// Name, what it is for, and how many. Taking the last one away removes the device from the room.
export default function DeviceRow({ roomId, device }) {
  const { dispatch, actions } = useHome();
  const meta = getDevice(device.deviceId);
  if (!meta) return null;
  const last = device.qty <= 1;

  return (
    <div className="device-row">
      <span className="device-name">{meta.name}</span>
      <DeviceInfo blurb={meta.blurb} />
      <div className="qty-stepper">
        <button
          type="button"
          aria-label={last ? `Remove ${meta.name}` : `One less ${meta.name}`}
          onClick={() => dispatch(last ? actions.removeDevice(roomId, device.deviceId) : actions.setDeviceQty(roomId, device.deviceId, device.qty - 1))}
        >
          {last
            ? <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            : '−'}
        </button>
        <span className="qty-val num">{device.qty}</span>
        <button type="button" aria-label={`One more ${meta.name}`} onClick={() => dispatch(actions.setDeviceQty(roomId, device.deviceId, device.qty + 1))}>+</button>
      </div>
    </div>
  );
}
