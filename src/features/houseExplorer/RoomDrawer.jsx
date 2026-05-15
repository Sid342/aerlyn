import { useHome } from '../../context/HomeContext.jsx';
import { getDevice } from '../../data/devices.js';
import { planRoom } from '../../lib/switchPlanner.js';
import ScenePresets from './ScenePresets.jsx';
import './RoomDrawer.css';

export default function RoomDrawer({ roomId, onClose }) {
  const { home, dispatch, actions } = useHome();
  const room = home.rooms.find((r) => r.id === roomId);
  if (!room) return null;

  const plan = planRoom(room);

  const switchboardParts = [
    plan.gang > 0 && `${plan.gang}-gang`,
    plan.fan > 0 && `${plan.fan} fan`,
    plan.curtain > 0 && `${plan.curtain} curtain`,
    plan.socket > 0 && `${plan.socket} socket`,
  ].filter(Boolean);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-label={`${room.name} controls`}>
        <div className="drawer-handle" />
        <div className="drawer-header">
          <span className="drawer-title">{room.name}</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="drawer-body">
          {room.devices.length === 0 && (
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No devices in this room.</p>
          )}
          {room.devices.map((d) => {
            const meta = getDevice(d.deviceId);
            if (!meta) return null;
            return (
              <div key={d.deviceId} className="drawer-device-row">
                <span className="drawer-device-icon">{meta.icon}</span>
                <span className="drawer-device-name">
                  {meta.name}
                  {d.qty > 1 && <span className="drawer-device-qty">×{d.qty}</span>}
                </span>
                <button
                  type="button"
                  className={`device-toggle${d.on ? ' on' : ''}`}
                  aria-pressed={d.on}
                  aria-label={`Toggle ${meta.name}`}
                  onClick={() => dispatch(actions.toggleDevice(room.id, d.deviceId))}
                />
              </div>
            );
          })}

          {switchboardParts.length > 0 && (
            <div className="drawer-switchboard">
              <strong>Switchboard:</strong> {switchboardParts.join(' · ')}
            </div>
          )}

          <div className="drawer-scenes">
            <div className="drawer-scenes-label">Quick scenes for this room:</div>
            <ScenePresets roomId={room.id} />
          </div>
        </div>
      </div>
    </>
  );
}
