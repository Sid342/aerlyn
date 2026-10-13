import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { fullPlateConfig } from '../../context/homeReducer.js';
import StepModel from './steps/StepModel.jsx';
import StepMaterial from './steps/StepMaterial.jsx';
import StepSize from './steps/StepSize.jsx';
import StepAccessories from './steps/StepAccessories.jsx';
import StepIcons from './steps/StepIcons.jsx';
import StepPanel from './steps/StepPanel.jsx';
import StepFrame from './steps/StepFrame.jsx';
import StepExport from './steps/StepExport.jsx';
import './TouchPlateDesigner.css';

const STEP_LABELS = ['Model', 'Material', 'Size', 'Accessories', 'Icons', 'Panel', 'Frame', 'Export'];

export default function TouchPlateDesigner() {
  const [step, setStep] = useState(0);
  const { home, dispatch, actions } = useHome();
  if (!home.homeType) return null;

  const config = fullPlateConfig(home.plateConfig);
  const setConfig = (next) => dispatch(actions.setPlateConfig(next));
  const plateRoom = home.rooms.find((r) => r.id === home.plateRoomId);

  function canAdvance() {
    if (step === 0) return !!config.model;
    if (step === 1) return !!config.material;
    if (step === 2) return !!config.size;
    return true;
  }

  function renderStep() {
    switch (step) {
      case 0: return <StepModel config={config} onChange={setConfig} />;
      case 1: return <StepMaterial config={config} onChange={setConfig} />;
      case 2: return <StepSize config={config} onChange={setConfig} />;
      case 3: return <StepAccessories config={config} onChange={setConfig} />;
      case 4: return <StepIcons config={config} onChange={setConfig} />;
      case 5: return <StepPanel config={config} onChange={setConfig} />;
      case 6: return <StepFrame config={config} onChange={setConfig} />;
      case 7: return <StepExport config={config} />;
      default: return null;
    }
  }

  return (
    <div className="tpd" id="plate-designer">
      <h2>Touch Plate Designer</h2>
      <p className="tpd-sub">
        Configure and visualise your Aerlyn smart switch plate.
        {plateRoom && <> Designing for: <strong>{plateRoom.name}</strong>.</>}
      </p>

      <div className="tpd-stepper">
        {STEP_LABELS.map((label, i) => (
          <button
            type="button"
            key={label}
            className={`tpd-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            aria-current={i === step ? 'step' : undefined}
            disabled={i >= step}
            onClick={() => setStep(i)}
          >
            {i < step ? '✓ ' : ''}{label}
          </button>
        ))}
      </div>

      {renderStep()}

      <div className="tpd-nav">
        <button
          type="button"
          className="tpd-nav-btn"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          Back
        </button>
        {step < STEP_LABELS.length - 1 && (
          <button
            type="button"
            className="tpd-nav-btn primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
