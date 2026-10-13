import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { planSummary } from '../../lib/planSummary.js';
import SavePlanModal from './SavePlanModal.jsx';
import './PlanBar.css';

const TOTALS = [
  ['rooms', 'room', 'rooms'],
  ['devices', 'device', 'devices'],
  ['plates', 'switch plate', 'switch plates'],
];

export default function PlanBar() {
  const { home } = useHome();
  const [saving, setSaving] = useState(false);
  if (!home.homeType) return null;
  const summary = planSummary(home);

  return (
    <>
      <div className="plan-dock" role="region" aria-label="Your plan">
        <div className="plan-bar">
          <ul className="plan-bar-totals">
            {TOTALS.map(([key, one, many]) => (
              <li key={key}><strong>{summary[key]}</strong>{summary[key] === 1 ? one : many}</li>
            ))}
          </ul>
          <button type="button" className="plan-bar-save" onClick={() => setSaving(true)}>
            Save my plan &amp; get a free quote
          </button>
        </div>
      </div>
      {saving && <SavePlanModal onClose={() => setSaving(false)} />}
    </>
  );
}
