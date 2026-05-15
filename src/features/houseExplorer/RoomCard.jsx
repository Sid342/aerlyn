import { useState } from 'react';
import DeviceRow from './DeviceRow.jsx';
import AddDeviceMenu from './AddDeviceMenu.jsx';
import SwitchPlanCard from './SwitchPlanCard.jsx';
import { useHome } from '../../context/HomeContext.jsx';
import './RoomCard.css';

const SIZES = ['S', 'M', 'L'];

export default function RoomCard({ room }) {
  const { home, dispatch, actions } = useHome();
  const isPlay = home.mode === 'play';
  const [open, setOpen] = useState(!isPlay);
  const presentIds = room.devices.map((d) => d.deviceId);
  const onCount = room.devices.filter((d) => d.on).length;

  return (
    <div className="card room-card" id={`room-${room.id}`}>
      <div className="room-card-head">
        {isPlay ? (
          <button
            type="button"
            className="room-name-collapse"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="room-collapse-arrow">{open ? '▾' : '▸'}</span>
            {room.name}
            {!open && onCount > 0 && <span className="room-on-badge">{onCount} on</span>}
          </button>
        ) : (
          <input
            className="room-name-input"
            value={room.name}
            onChange={(e) => dispatch(actions.renameRoom(room.id, e.target.value))}
            aria-label="Room name"
          />
        )}
        {!isPlay && (
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
        )}
        {!isPlay && (
          <>
            <button
              type="button"
              className="room-dup-btn"
              aria-label={`Duplicate ${room.name}`}
              onClick={() => dispatch(actions.duplicateRoom(room.id))}
            >
              Duplicate
            </button>
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
          </>
        )}
      </div>

      {open && (
        <>
          <SwitchPlanCard room={room} />

          <div style={{ marginTop: 10 }}>
            {room.devices.length === 0 && (
              <div className="device-cat">No devices in this room yet.</div>
            )}
            {room.devices.map((d) => (
              <DeviceRow key={d.deviceId} roomId={room.id} device={d} />
            ))}
          </div>

          {!isPlay && <AddDeviceMenu roomId={room.id} presentIds={presentIds} />}
        </>
      )}
    </div>
  );
}
