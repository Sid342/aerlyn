import { HOME_TYPES } from '../../data/templates.js';
import { useHome } from '../../context/HomeContext.jsx';
import './HomeTypePicker.css';

export default function HomeTypePicker() {
  const { home, dispatch, actions } = useHome();

  function pick(type) {
    if (
      home.homeType &&
      home.homeType !== type &&
      !window.confirm('Switching home type rebuilds the room list. Continue?')
    ) {
      return;
    }
    dispatch(actions.setHomeType(type));
  }

  return (
    <div className="card">
      <h3>1. Pick the home</h3>
      <p style={{ color: 'var(--text-dim)', margin: '4px 0 14px' }}>
        Start from the closest match — you can reshape every room next.
      </p>
      <div className="htp">
        {HOME_TYPES.map((t) => (
          <button
            key={t}
            className={`htp-btn${home.homeType === t ? ' active' : ''}`}
            onClick={() => pick(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
