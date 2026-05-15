import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import './RoomScenes.css';

export default function RoomScenes({ room }) {
  const { home, actions } = useHome();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const scenes = home.customScenes.filter(s => s.roomId === room.id);
  const devices = room.devices ?? [];

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    actions.addCustomScene(room.id, trimmed);
    setNewName('');
  }

  return (
    <div className="room-scenes">
      <h4>Scenes</h4>

      <div className="rs-add-row">
        <input
          className="rs-name-input"
          placeholder="New scene name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="rs-add-btn" onClick={handleAdd}>Add</button>
      </div>

      {scenes.length === 0 && <p className="rs-empty">No scenes for this room yet.</p>}

      {scenes.map(scene => (
        <div key={scene.id} className="rs-scene">
          <div className="rs-scene-header">
            {editingId === scene.id ? (
              <input
                className="rs-rename-input"
                value={editName}
                autoFocus
                onChange={e => setEditName(e.target.value)}
                onBlur={() => { actions.renameCustomScene(scene.id, editName); setEditingId(null); }}
                onKeyDown={e => { if (e.key === 'Enter') { actions.renameCustomScene(scene.id, editName); setEditingId(null); } }}
              />
            ) : (
              <span className="rs-scene-name" onDoubleClick={() => { setEditingId(scene.id); setEditName(scene.name); }}>
                {scene.icon} {scene.name}
              </span>
            )}
            <div className="rs-scene-actions">
              <button className="rs-apply-btn" onClick={() => actions.applySceneToRoom(room.id, scene.deviceStates)}>Apply</button>
              <button className="rs-del-btn" onClick={() => actions.removeCustomScene(scene.id)}>✕</button>
            </div>
          </div>

          <div className="rs-device-toggles">
            {devices.map(dev => (
              <label key={dev.deviceId} className="rs-dev-toggle">
                <input
                  type="checkbox"
                  checked={!!scene.deviceStates[dev.deviceId]}
                  onChange={e => actions.setSceneDeviceState(scene.id, dev.deviceId, e.target.checked)}
                />
                {dev.deviceId}
              </label>
            ))}
            {devices.length === 0 && <span className="rs-no-devices">No devices in room</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
