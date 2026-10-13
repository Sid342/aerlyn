import { useEffect, useRef, useState } from 'react';
import { devicesInHome } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import { downloadScenesPdf } from '../../lib/exportScenesPdf.js';
import { useDownload, PDF_FAILED } from '../../lib/useDownload.js';
import InlineConfirm from '../shared/InlineConfirm.jsx';
import './SceneBuilder.css';

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
      {devices.length === 0 && <p className="plan-hint">No devices in your plan yet.</p>}
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
              {on ? 'On' : 'Off'}
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
        className="lead-input"
        placeholder="Scene name"
        aria-label="New scene name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button type="button" className="btn quiet" onClick={handleAdd}>Add scene</button>
    </div>
  );
}

// Under Customise: scenes the visitor makes. They join the ready-made ones in "See it in action".
export default function SceneBuilder() {
  const { home } = useHome();
  const [download, pdfFailed] = useDownload(downloadScenesPdf);

  return (
    <div className="scene-builder">
      <p className="plan-hint">A scene sets several devices with one tap. Name one, then choose what it switches on.</p>
      <div className="sb-cards">
        {home.customScenes.map((scene) => (
          <CustomSceneCard key={scene.id} scene={scene} />
        ))}
      </div>
      <AddSceneForm />
      <button type="button" className="link-btn" onClick={() => download(home.customScenes, home.rooms)}>Download scenes PDF</button>
      {pdfFailed && <div className="field-error" role="alert">{PDF_FAILED}</div>}
    </div>
  );
}
