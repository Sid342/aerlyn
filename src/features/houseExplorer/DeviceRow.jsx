import { getDevice } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';

export default function DeviceRow({ roomId, device }) {
  const { home, dispatch, actions } = useHome();
  const meta = getDevice(device.deviceId);
  if (!meta) return null;

  if (home.mode === 'play') {
    return (
      <div className="device-row">
        <span className="device-icon">{meta.icon}</span>
        <span className="device-name">
          {meta.name} <span className="device-cat">×{device.qty}</span>
        </span>
        <button
          type="button"
          className={`play-toggle${device.on ? ' on' : ''}`}
          aria-label={`Toggle ${meta.name}`}
          aria-pressed={device.on}
          onClick={() => dispatch(actions.toggleDevice(roomId, device.deviceId))}
        />
      </div>
    );
  }

  return (
    <div className="device-row">
      <span className="device-icon">{meta.icon}</span>
      <span className="device-name">
        {meta.name}
      </span>
      <div className="qty-stepper">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => dispatch(actions.setDeviceQty(roomId, device.deviceId, device.qty - 1))}
        >
          −
        </button>
        <span className="qty-val num">{device.qty}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => dispatch(actions.setDeviceQty(roomId, device.deviceId, device.qty + 1))}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="device-del"
        aria-label={`Remove ${meta.name}`}
        onClick={() => dispatch(actions.removeDevice(roomId, device.deviceId))}
      >
        ×
      </button>
    </div>
  );
}
