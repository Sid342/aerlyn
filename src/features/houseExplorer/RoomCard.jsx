import { useState } from 'react';
import DeviceRow from './DeviceRow.jsx';
import AddDeviceMenu from './AddDeviceMenu.jsx';
import SwitchPlanCard from './SwitchPlanCard.jsx';
import { useHome } from '../../context/HomeContext.jsx';
import InlineConfirm from '../shared/InlineConfirm.jsx';

const SIZES = [['S', 'Small'], ['M', 'Medium'], ['L', 'Large']];
const count = (n) => `${n} ${n === 1 ? 'device' : 'devices'}`;

export default function RoomCard({ room, index }) {
  const { dispatch, actions } = useHome();
  const [removing, setRemoving] = useState(false);

  return (
    <details className="room-card" id={`room-${room.id}`}>
      <summary>
        <span className="room-card-name">{room.name}</span>
        <span className="room-card-count">{count(room.devices.length)}</span>
      </summary>

      <div className="room-card-body">
        <label className="lead-field">
          Room name
          <input className="lead-input" value={room.name} onChange={(e) => dispatch(actions.renameRoom(room.id, e.target.value))} />
        </label>

        <div className="device-rows">
          {room.devices.length === 0 && <p className="plan-hint">Nothing in this room yet.</p>}
          {room.devices.map((d) => <DeviceRow key={d.deviceId} roomId={room.id} device={d} />)}
        </div>
        <AddDeviceMenu roomId={room.id} presentIds={room.devices.map((d) => d.deviceId)} />

        <div className="room-card-actions">
          <button type="button" className="link-btn" onClick={() => dispatch(actions.duplicateRoom(room.id))}>Duplicate room</button>
          <button type="button" className="link-btn danger" onClick={() => setRemoving(true)}>Remove room</button>
        </div>
        {removing && (
          <InlineConfirm
            message={`Remove ${room.name} and everything in it?`}
            confirmLabel="Remove room"
            cancelLabel="Keep it"
            onConfirm={() => dispatch(actions.removeRoom(room.id))}
            onCancel={() => setRemoving(false)}
          />
        )}

        <details className="installer">
          <summary>Installer details</summary>
          <div className="installer-size" role="group" aria-label="Room size">
            <span>Room size</span>
            {SIZES.map(([s, label]) => (
              <button key={s} type="button" aria-pressed={room.size === s} onClick={() => dispatch(actions.setRoomSize(room.id, s))}>{label}</button>
            ))}
          </div>
          <SwitchPlanCard room={room} index={index} />
        </details>
      </div>
    </details>
  );
}
