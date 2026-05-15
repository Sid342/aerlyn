import { planRoom } from '../../lib/switchPlanner.js';
import './SwitchPlanCard.css';

const PLATE_LABELS = (plates) =>
  plates.length === 0
    ? '—'
    : Object.entries(
        plates.reduce((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {})
      )
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([size, count]) => `${count}× ${size}-mod`)
        .join(' + ');

export default function SwitchPlanCard({ room }) {
  const plan = planRoom(room);
  if (plan.total === 0) return null;
  return (
    <div className="switch-plan">
      <div className="switch-plan-title">Switch plan</div>
      <ul className="switch-plan-breakdown">
        <li><span>Light gangs</span><span className="num">{plan.gang}</span></li>
        <li><span>Fan regulators</span><span className="num">{plan.fan}</span></li>
        <li><span>Curtain switches</span><span className="num">{plan.curtain}</span></li>
        <li><span>Charging sockets</span><span className="num">{plan.socket}</span></li>
        <li className="switch-plan-total"><span>Total modules</span><span className="num">{plan.total}</span></li>
      </ul>
      <div className="switch-plan-rec">
        Plates: <strong>{PLATE_LABELS(plan.plates)}</strong>
        {plan.spareModules > 0 && <span className="spare"> (spare: {plan.spareModules})</span>}
      </div>
    </div>
  );
}
