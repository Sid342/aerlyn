import { useState } from 'react';
import { SCENES } from '../../data/scenes.js';
import { DEVICES } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import { downloadScenesPdf } from '../../lib/exportScenesPdf.js';
import './SceneBuilder.css';

function deviceName(deviceId) {
  const d = DEVICES.find((x) => x.id === deviceId);
  return d ? d.name : deviceId;
}

function PresetSceneCard({ scene }) {
  const entries = Object.entries(scene.deviceStates);
  return (
    <div className="sb-card">
      <div className="sb-card-header">
        <span className="sb-card-icon">{scene.icon}</span>
        <span className="sb-card-name">{scene.name}</span>
      </div>
      {entries.map(([deviceId, on]) => (
        <div key={deviceId} className="sb-device-row">
          <span className="sb-device-name">{deviceName(deviceId)}</span>
          <span className={`sb-device-state ${on ? 'on' : 'off'}`}>{on ? 'ON' : 'OFF'}</span>
        </div>
      ))}
      {entries.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No devices</p>}
    </div>
  );
}

function CustomSceneCard({ scene }) {
  const { actions } = useHome();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(scene.name);

  function handleNameBlur() {
    if (draftName.trim()) actions.renameCustomScene(scene.id, draftName.trim());
    setEditing(false);
  }

  function handleRemove() {
    if (window.confirm(`Remove scene "${scene.name}"?`)) {
      actions.removeCustomScene(scene.id);
    }
  }

  return (
    <div className="sb-card">
      <div className="sb-card-header">
        <span className="sb-card-icon">{scene.icon}</span>
        <span className="sb-card-name">
          {editing ? (
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            />
          ) : (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {scene.name}
            </span>
          )}
        </span>
      </div>
      {DEVICES.map((device) => {
        const on = scene.deviceStates[device.id] ?? false;
        return (
          <div key={device.id} className="sb-device-row">
            <span className="sb-device-name">{device.name}</span>
            <button
              type="button"
              className="sb-device-toggle"
              aria-pressed={on}
              onClick={() => actions.setSceneDeviceState(scene.id, device.id, !on)}
            >
              {on ? 'ON' : 'OFF'}
            </button>
          </div>
        );
      })}
      <button type="button" className="sb-remove-btn" onClick={handleRemove}>
        Remove scene
      </button>
    </div>
  );
}

function AddSceneForm() {
  const { actions } = useHome();
  const [name, setName] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    actions.addCustomScene(trimmed);
    setName('');
  }

  return (
    <div className="sb-add-form">
      <input
        type="text"
        className="sb-add-input"
        placeholder="Scene name (e.g. Dinner Party)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button type="button" className="sb-add-btn" onClick={handleAdd}>
        + Add Scene
      </button>
    </div>
  );
}

export default function SceneBuilder() {
  const { home } = useHome();

  return (
    <div className="scene-builder">
      <h2>Scene Builder</h2>
      <p className="sb-sub">View preset automations and create your own custom scenes.</p>

      <div className="sb-section-label">Preset Scenes</div>
      <div className="sb-cards">
        {SCENES.map((scene) => (
          <PresetSceneCard key={scene.id} scene={scene} />
        ))}
      </div>

      <div className="sb-section-label">Custom Scenes</div>
      <div className="sb-cards">
        {home.customScenes.map((scene) => (
          <CustomSceneCard key={scene.id} scene={scene} />
        ))}
      </div>
      <AddSceneForm />

      <div className="sb-export-row">
        <button
          type="button"
          className="sb-export-btn"
          onClick={() => downloadScenesPdf(home.customScenes)}
        >
          Download Scenes PDF
        </button>
      </div>
    </div>
  );
}
