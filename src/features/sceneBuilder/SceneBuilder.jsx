import { useEffect, useRef, useState } from 'react';
import { SCENES } from '../../data/scenes.js';
import { DEVICES, devicesInHome } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import { downloadScenesPdf } from '../../lib/exportScenesPdf.js';
import { useDownload, PDF_FAILED } from '../../lib/useDownload.js';
import InlineConfirm from '../shared/InlineConfirm.jsx';
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
  const { home, actions } = useHome();
  const devices = devicesInHome(home.rooms);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(scene.name);
  const [removing, setRemoving] = useState(false);
  const renameBtn = useRef(null);
  const wasEditing = useRef(false);

  // After a rename, focus goes back to the name button instead of being dropped.
  useEffect(() => {
    if (wasEditing.current && !editing) renameBtn.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  function handleNameBlur() {
    if (draftName.trim()) actions.renameCustomScene(scene.id, draftName.trim());
    setEditing(false);
  }

  return (
    <div className="sb-card">
      <div className="sb-card-header">
        <span className="sb-card-icon">{scene.icon}</span>
        <span className="sb-card-name">
          {editing ? (
            <input
              autoFocus
              aria-label="Scene name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            />
          ) : (
            <button
              type="button"
              ref={renameBtn}
              className="sb-rename"
              aria-label={`Rename scene ${scene.name}`}
              title="Rename"
              onClick={() => setEditing(true)}
            >
              {scene.name}
            </button>
          )}
        </span>
      </div>
      {devices.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No devices in your home yet</p>}
      {devices.map((device) => {
        const on = scene.deviceStates[device.id] ?? false;
        return (
          <div key={device.id} className="sb-device-row">
            <span className="sb-device-name">{device.name}</span>
            <button
              type="button"
              className="sb-device-toggle"
              aria-pressed={on}
              aria-label={device.name}
              onClick={() => actions.setSceneDeviceState(scene.id, device.id, !on)}
            >
              {on ? 'ON' : 'OFF'}
            </button>
          </div>
        );
      })}
      <button type="button" className="sb-remove-btn" onClick={() => setRemoving(true)}>
        Remove scene
      </button>
      {removing && (
        <InlineConfirm
          message={`Remove scene “${scene.name}”?`}
          confirmLabel="Remove scene"
          cancelLabel="Keep it"
          onConfirm={() => actions.removeCustomScene(scene.id)}
          onCancel={() => setRemoving(false)}
        />
      )}
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
        aria-label="New scene name"
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
  const [download, pdfFailed] = useDownload(downloadScenesPdf);
  if (!home.homeType) return null;

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
          onClick={() => download(home.customScenes, home.rooms)}
        >
          Download Scenes PDF
        </button>
      </div>
      {pdfFailed && <div className="field-error sb-export-error" role="alert">{PDF_FAILED}</div>}
    </div>
  );
}
