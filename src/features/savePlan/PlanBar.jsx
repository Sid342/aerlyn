import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { planSummaryText } from '../../lib/planSummary.js';
import SavePlanModal from './SavePlanModal.jsx';
import './PlanBar.css';

export default function PlanBar() {
  const { home, restore, openLinkedPlan, dismissRestore } = useHome();
  const [saving, setSaving] = useState(false);
  if (!home.homeType && !restore.notice) return null;

  return (
    <>
      <div className="plan-dock" role="region" aria-label="Your plan">
        {restore.pendingLink ? (
          <div className="plan-notice" role="alert">
            <span>This link opens a different plan. Opening it replaces the plan saved in this browser.</span>
            <button type="button" className="plan-notice-btn primary" onClick={openLinkedPlan}>Open the linked plan</button>
            <button type="button" className="plan-notice-btn" onClick={dismissRestore}>Keep my plan</button>
          </div>
        ) : restore.notice && (
          <div className="plan-notice" role="status">
            <span>
              {restore.notice === 'restored'
                ? 'Welcome back — your plan is restored.'
                : 'This plan link is incomplete, so the plan could not be opened.'}
            </span>
            <button type="button" className="plan-notice-btn" onClick={dismissRestore} aria-label="Dismiss">✕</button>
          </div>
        )}
        {home.homeType && (
          <div className="plan-bar">
            <p className="plan-bar-summary">{planSummaryText(home)}</p>
            <button type="button" className="plan-bar-save" onClick={() => setSaving(true)}>
              Save my plan &amp; get a free quote
            </button>
          </div>
        )}
      </div>
      {saving && <SavePlanModal onClose={() => setSaving(false)} />}
    </>
  );
}
