import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { fullPlateConfig } from '../../context/homeReducer.js';
import { MODULE_OPTIONS, PROFILE_OPTIONS, FINISH_OPTIONS, FRAME_OPTIONS } from '../../data/plateAccessories.js';
import { plateLayout } from '../../lib/plateLayout.js';
import PlatePreview from './PlatePreview.jsx';
import OptionGrid from './steps/OptionGrid.jsx';
import StepMaterial from './steps/StepMaterial.jsx';
import StepAccessories from './steps/StepAccessories.jsx';
import StepIcons from './steps/StepIcons.jsx';
import StepExport from './steps/StepExport.jsx';
import './TouchPlateDesigner.css';

const STEPS = [
  { id: 'model', label: 'Size' },
  { id: 'material', label: 'Colour' },
  { id: 'profile', label: 'Profile' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'icons', label: 'Icons' },
  { id: 'finish', label: 'Finish' },
  { id: 'export', label: 'Summary' },
];
const REQUIRED = { model: 'model', material: 'material', profile: 'size' };
const sizeOptions = MODULE_OPTIONS.map((o) => ({ ...o, sub: `${o.maxSlots} modules` }));

export default function TouchPlateDesigner() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null); // switch button being given an icon
  const { home, dispatch, actions } = useHome();
  if (!home.homeType) return null;

  const config = fullPlateConfig(home.plateConfig);
  const setConfig = (next) => dispatch(actions.setPlateConfig(next));
  const plateRoom = home.rooms.find((r) => r.id === home.plateRoomId);
  const layout = plateLayout(config);
  const switches = layout ? layout.controls.filter((c) => c.kind === 'switch') : [];
  const selectedKey = (switches.find((c) => c.key === selected) || switches[0])?.key;

  const id = STEPS[step].id;
  // the icons step has nothing to do on a plate without switch buttons
  const skipped = (i) => STEPS[i].id === 'icons' && switches.length === 0;
  const move = (dir) => setStep((s) => (skipped(s + dir) ? s + 2 * dir : s + dir));
  const canAdvance = !REQUIRED[id] || !!config[REQUIRED[id]];

  function renderStep() {
    switch (id) {
      case 'model':
        return (
          <OptionGrid title="Choose plate size" options={sizeOptions} value={config.model}
            onPick={(o) => setConfig({ ...config, model: o.label, maxSlots: o.maxSlots, accessories: [], icons: {} })} />
        );
      case 'material': return <StepMaterial config={config} onChange={setConfig} />;
      case 'profile':
        return (
          <OptionGrid title="Choose plate profile" options={PROFILE_OPTIONS} value={config.size}
            onPick={(o) => setConfig({ ...config, size: o.label })} />
        );
      case 'accessories': return <StepAccessories config={config} onChange={setConfig} />;
      case 'icons':
        return <StepIcons config={config} onChange={setConfig} switches={switches} selected={selectedKey} onSelect={setSelected} />;
      case 'finish':
        return (
          <>
            <OptionGrid title="Panel finish" options={FINISH_OPTIONS} value={config.panel}
              onPick={(o) => setConfig({ ...config, panel: o.label })} />
            <OptionGrid title="Frame style" options={FRAME_OPTIONS} value={config.frame}
              onPick={(o) => setConfig({ ...config, frame: o.label })} />
          </>
        );
      default: return <StepExport config={config} roomName={plateRoom ? plateRoom.name : null} />;
    }
  }

  const caption = [config.model, config.material, config.size, config.panel, config.frame].filter(Boolean).join(' · ');

  return (
    <div className="tpd" id="plate-designer">
      <h2>Touch Plate Designer{plateRoom && <> — {plateRoom.name}</>}</h2>
      <p className="tpd-sub">
        {plateRoom
          ? <>Design the switch plate for your <strong>{plateRoom.name}</strong>. The drawing updates as you choose.</>
          : 'Design your Aerlyn smart switch plate. The drawing updates as you choose.'}
      </p>

      <div className="tpd-stepper">
        {STEPS.map((s, i) => (
          <button
            type="button"
            key={s.id}
            className={`tpd-step${i === step ? ' active' : ''}${i < step && !skipped(i) ? ' done' : ''}`}
            aria-current={i === step ? 'step' : undefined}
            disabled={i >= step || skipped(i)}
            onClick={() => setStep(i)}
          >
            {i < step && !skipped(i) ? '✓ ' : ''}{s.label}
          </button>
        ))}
      </div>

      <div className="tpd-body">
        <div className="tpd-stage">
          <PlatePreview config={config} selected={selectedKey} onSelect={id === 'icons' ? setSelected : undefined} />
          {caption && <p className="tpd-caption">{caption}</p>}
          <p className="tpd-caption tpd-caption-note">Illustration only — not to scale.</p>
        </div>

        <div className="tpd-panel">
          {renderStep()}
          <div className="tpd-nav">
            <button type="button" className="tpd-nav-btn" onClick={() => move(-1)} disabled={step === 0}>
              Back
            </button>
            {step < STEPS.length - 1 && (
              <button type="button" className="tpd-nav-btn primary" onClick={() => move(1)} disabled={!canAdvance}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
