import DeviceRow from './DeviceRow.jsx';
import AddDeviceMenu from './AddDeviceMenu.jsx';
import { useHome } from '../../context/HomeContext.jsx';
import './RoomCard.css';

const SIZES = ['S', 'M', 'L'];

export default function RoomCard({ room }) {
  const { home, dispatch, actions } = useHome();
  // d.deviceId matches DEVICES[n].id — AddDeviceMenu filters incoming presentIds against device.id
  const presentIds = room.devices.map((d) => d.deviceId);

  return (
    <div className="card room-card" id={`room-${room.id}`}>
      <div className="room-card-head">
        <input
          className="room-name-input"
          value={room.name}
          onChange={(e) => dispatch(actions.renameRoom(room.id, e.target.value))}
          aria-label="Room name"
        />
        <div className="room-size-group">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={room.size === s ? 'active' : ''}
              aria-pressed={room.size === s}
              onClick={() => dispatch(actions.setRoomSize(room.id, s))}
              aria-label={`Size ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="room-remove-btn"
          aria-label={`Remove ${room.name}`}
          onClick={() => {
            if (window.confirm(`Remove ${room.name}?`)) {
              dispatch(actions.removeRoom(room.id));
            }
          }}
        >
          Remove
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        {room.devices.length === 0 && (
          <div className="device-cat">No devices in this room yet.</div>
        )}
        {room.devices.map((d) => (
          <DeviceRow key={d.deviceId} roomId={room.id} device={d} />
        ))}
      </div>

      {home.mode === 'build' && <AddDeviceMenu roomId={room.id} presentIds={presentIds} />}
    </div>
  );
}
