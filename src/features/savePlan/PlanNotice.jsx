import { useHome } from '../../context/HomeContext.jsx';
import InlineConfirm from '../shared/InlineConfirm.jsx';

// What happened to a plan link that could not simply be opened.
export default function PlanNotice() {
  const { restore, openLinkedPlan, dismissRestore } = useHome();
  if (restore.pendingLink) {
    return (
      <InlineConfirm
        message="This link opens a different plan. Opening it replaces the plan saved on this device."
        confirmLabel="Open the linked plan"
        cancelLabel="Keep my plan"
        onConfirm={openLinkedPlan}
        onCancel={dismissRestore}
      />
    );
  }
  if (restore.notice !== 'badlink') return null;
  return (
    <div className="inline-confirm" role="status">
      <span>This plan link is incomplete, so we could not open it.</span>
      <button type="button" className="plan-notice-btn" onClick={dismissRestore}>Dismiss</button>
    </div>
  );
}
