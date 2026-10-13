import { useState } from 'react';
import { HOME_TYPES } from '../../data/templates.js';
import { useHome } from '../../context/HomeContext.jsx';
import InlineConfirm from '../shared/InlineConfirm.jsx';
import './HomeTypePicker.css';

export default function HomeTypePicker() {
  const { home, dispatch, actions } = useHome();

  const [pending, setPending] = useState(null); // home type waiting for a confirm

  function pick(type) {
    if (home.homeType && home.homeType !== type) {
      setPending(type);
      return;
    }
    setPending(null);
    dispatch(actions.setHomeType(type));
  }

  function confirmSwitch() {
    dispatch(actions.setHomeType(pending));
    setPending(null);
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
      {pending && (
        <InlineConfirm
          message={`Switching to ${pending} rebuilds the room list.`}
          confirmLabel={`Switch to ${pending}`}
          cancelLabel="Keep my rooms"
          onConfirm={confirmSwitch}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
