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
      <p className="htp-hint">
        Start from the closest match — you can reshape every room next.
      </p>
      <div className="htp">
        {HOME_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`htp-btn${home.homeType === t ? ' active' : ''}`}
            aria-pressed={home.homeType === t}
            onClick={() => pick(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
