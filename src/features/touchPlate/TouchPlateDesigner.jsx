import { useState } from 'react';
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

const emptyConfig = {
  model: null,
  maxSlots: 0,
  material: null,
  materialCode: null,
  size: null,
  accessories: [],
  icons: {},
  panel: null,
  frame: null,
};

export default function TouchPlateDesigner() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(emptyConfig);

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
    <div className="tpd">
      <h2>Touch Plate Designer</h2>
      <p className="tpd-sub">Configure and visualise your Aerlyn smart switch plate.</p>

      <div className="tpd-stepper">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`tpd-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            onClick={() => i < step && setStep(i)}
          >
            {i < step ? '✓ ' : ''}{label}
          </div>
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
