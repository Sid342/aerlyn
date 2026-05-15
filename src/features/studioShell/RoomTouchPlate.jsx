import { useState, useEffect } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { PlatePreview } from './PlatePreview.jsx';
import { MODULE_OPTIONS } from '../touchPlate/steps/StepModel.jsx';
import { MATERIAL_COLORS } from '../touchPlate/steps/StepMaterial.jsx';
import { ACCESSORIES } from '../touchPlate/steps/StepAccessories.jsx';
import { downloadPlatePdf } from '../../lib/exportPlatePdf.js';
import './RoomTouchPlate.css';

export default function RoomTouchPlate({ room }) {
  const { actions } = useHome();

  const [model, setModel] = useState(room.plateConfig?.model ?? MODULE_OPTIONS[0].label);
  const [materialCode, setMaterialCode] = useState(room.plateConfig?.materialCode ?? MATERIAL_COLORS[0].code);
  const [slots, setSlots] = useState(room.plateConfig?.slots ?? []);
  const [frame, setFrame] = useState(room.plateConfig?.frame ?? 'black');

  // Re-init when room changes
  useEffect(() => {
    setModel(room.plateConfig?.model ?? MODULE_OPTIONS[0].label);
    setMaterialCode(room.plateConfig?.materialCode ?? MATERIAL_COLORS[0].code);
    setSlots(room.plateConfig?.slots ?? []);
    setFrame(room.plateConfig?.frame ?? 'black');
  }, [room.id]);

  const maxSlots = MODULE_OPTIONS.find(m => m.label === model)?.maxSlots ?? 4;
  const availableAccessories = ACCESSORIES[model] ?? [];
  const config = { model, materialCode, slots, frame };

  // Persist on model/material/frame change
  useEffect(() => {
    actions.setPlateConfig(room.id, { model, materialCode, slots, frame });
  }, [model, materialCode, frame]); // eslint-disable-line react-hooks/exhaustive-deps

  function addSlot(acc) {
    if (slots.length >= maxSlots) return;
    const newSlots = [...slots, { id: acc.id, name: acc.name, nodeSize: acc.nodeSize }];
    setSlots(newSlots);
    actions.setPlateConfig(room.id, { model, materialCode, slots: newSlots, frame });
  }

  function removeSlot(idx) {
    const newSlots = slots.filter((_, i) => i !== idx);
    setSlots(newSlots);
    actions.setPlateConfig(room.id, { model, materialCode, slots: newSlots, frame });
  }

  return (
    <div className="room-touch-plate">
      <h4>Touch Plate</h4>
      <div className="rtp-layout">
        <div className="rtp-controls">
          {/* Model select */}
          <label>Model
            <select value={model} onChange={e => setModel(e.target.value)}>
              {MODULE_OPTIONS.map(m => (
                <option key={m.label} value={m.label}>{m.label}</option>
              ))}
            </select>
          </label>

          {/* Material select */}
          <label>Material
            <select value={materialCode} onChange={e => setMaterialCode(e.target.value)}>
              {MATERIAL_COLORS.map(m => (
                <option key={m.code} value={m.code}>{m.label}</option>
              ))}
            </select>
          </label>

          {/* Frame select */}
          <label>Frame
            <select value={frame} onChange={e => setFrame(e.target.value)}>
              {['black', 'silver', 'white', 'gold'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          {/* Slots */}
          <div className="rtp-slots">
            <span>Slots ({slots.length}/{maxSlots})</span>
            <div className="rtp-slot-list">
              {slots.map((s, i) => (
                <span key={i} className="rtp-slot-chip">
                  {s.name} <button onClick={() => removeSlot(i)}>×</button>
                </span>
              ))}
            </div>
            {slots.length < maxSlots && (
              <select
                onChange={e => {
                  const acc = availableAccessories.find(a => a.id === e.target.value);
                  if (acc) addSlot(acc);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Add slot</option>
                {availableAccessories.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="rtp-preview">
          <PlatePreview config={config} size={110} />
          <button className="rtp-export-btn" onClick={() => downloadPlatePdf(config)}>
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
