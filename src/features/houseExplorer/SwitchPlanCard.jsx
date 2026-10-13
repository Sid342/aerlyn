import { computeRoomPoints, applyOverrides, recommendPlates } from '../../lib/switchPlanner.js';
import { useHome } from '../../context/HomeContext.jsx';
import { PLATE_PATH } from '../../routes.js';
import './SwitchPlanCard.css';

const PLATE_LABELS = (plates) =>
  plates.length === 0
    ? 'none'
    : Object.entries(
        plates.reduce((acc, p) => ({ ...acc, [p]: (acc[p] || 0) + 1 }), {})
      )
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([size, count]) => `${count}× ${size}-mod`)
        .join(' + ');

const ROWS = [
  { key: 'gang', label: 'Light gangs' },
  { key: 'fan', label: 'Fan regulators' },
  { key: 'curtain', label: 'Curtain switches' },
  { key: 'socket', label: 'Charging sockets' },
];

// For the installer: the wall modules the room's devices need, each count overridable.
// `index` is the room's position in the plan; the plate designer page reads it from the link.
export default function SwitchPlanCard({ room, index }) {
  const { dispatch, actions } = useHome();
  const auto = computeRoomPoints(room);
  const overrides = room.switchOverrides || {};
  const points = applyOverrides(auto, overrides);
  const plan = { ...points, ...recommendPlates(points.total) };

  function handleOverride(key, raw) {
    const trimmed = raw.trim();
    const value = trimmed === '' ? null : Math.max(0, parseInt(trimmed, 10) || 0);
    dispatch(actions.setSwitchOverride(room.id, key, value));
  }

  return (
    <div className="switch-plan">
      <ul className="switch-plan-breakdown">
        {ROWS.map(({ key, label }) => (
          <li key={key}>
            <label htmlFor={`${room.id}-${key}`}>{label}</label>
            <input
              id={`${room.id}-${key}`}
              className="switch-override-input"
              type="number"
              inputMode="numeric"
              min="0"
              placeholder={auto[key]}
              value={overrides[key] != null ? overrides[key] : ''}
              onChange={(e) => handleOverride(key, e.target.value)}
            />
          </li>
        ))}
        <li className="switch-plan-total">
          <span>Total modules</span>
          <span className="num">{plan.total}</span>
        </li>
      </ul>
      <div className="switch-plan-rec">
        Plates: <strong>{PLATE_LABELS(plan.plates)}</strong>
        {plan.spareModules > 0 && <span className="spare"> (spare: {plan.spareModules})</span>}
      </div>
      {plan.plates.length > 0 && (
        <a className="link-btn" href={`${PLATE_PATH}?room=${index}`}>Design this plate</a>
      )}
    </div>
  );
}
