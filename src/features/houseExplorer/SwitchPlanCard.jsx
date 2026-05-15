import { computeRoomPoints, applyOverrides, recommendPlates } from '../../lib/switchPlanner.js';
import { useHome } from '../../context/HomeContext.jsx';
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

const ROWS = [
  { key: 'gang', label: 'Light gangs' },
  { key: 'fan', label: 'Fan regulators' },
  { key: 'curtain', label: 'Curtain switches' },
  { key: 'socket', label: 'Charging sockets' },
];

export default function SwitchPlanCard({ room }) {
  const { home, dispatch, actions } = useHome();
  const auto = computeRoomPoints(room);
  const overrides = room.switchOverrides || {};
  const plan = { ...applyOverrides(auto, overrides), ...recommendPlates(applyOverrides(auto, overrides).total) };
  if (auto.total === 0 && Object.values(overrides).every((v) => v == null)) return null;

  const isBuild = home.mode === 'build';

  function handleOverride(key, raw) {
    const trimmed = raw.trim();
    const value = trimmed === '' ? null : Math.max(0, parseInt(trimmed, 10) || 0);
    dispatch(actions.setSwitchOverride(room.id, key, value));
  }

  return (
    <div className="switch-plan">
      <div className="switch-plan-title">Switch plan</div>
      <ul className="switch-plan-breakdown">
        {ROWS.map(({ key, label }) => {
          const autoVal = auto[key];
          const overVal = overrides[key];
          const displayVal = overVal != null ? overVal : autoVal;
          if (displayVal === 0 && !isBuild) return null;
          if (!isBuild && autoVal === 0 && overVal == null) return null;
          return (
            <li key={key}>
              <span>{label}</span>
              {isBuild ? (
                <input
                  className="switch-override-input"
                  type="number"
                  min="0"
                  placeholder={autoVal}
                  value={overVal != null ? overVal : ''}
                  onChange={(e) => handleOverride(key, e.target.value)}
                  aria-label={`Override ${label}`}
                />
              ) : (
                <span className="num">{displayVal}</span>
              )}
            </li>
          );
        })}
        <li className="switch-plan-total">
          <span>Total modules</span>
          <span className="num">{plan.total}</span>
        </li>
      </ul>
      <div className="switch-plan-rec">
        Plates: <strong>{PLATE_LABELS(plan.plates)}</strong>
        {plan.spareModules > 0 && <span className="spare"> (spare: {plan.spareModules})</span>}
      </div>
    </div>
  );
}
