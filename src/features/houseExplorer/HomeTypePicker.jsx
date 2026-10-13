import { useState } from 'react';
import { HOME_TYPES, TEMPLATES } from '../../data/templates.js';
import { useHome } from '../../context/HomeContext.jsx';
import { isCustomised } from '../../lib/planSummary.js';
import InlineConfirm from '../shared/InlineConfirm.jsx';

export default function HomeTypePicker() {
  const { home, plan, dispatch, actions } = useHome();
  const [pending, setPending] = useState(null); // home type waiting for a confirm

  function choose(type) {
    setPending(null);
    dispatch(actions.setHomeType(type));
    document.getElementById('planner').scrollIntoView();
  }

  // One tap, unless that would throw away rooms the visitor has edited.
  function pick(type) {
    if (type === home.homeType) return;
    if (home.homeType && isCustomised(plan)) setPending(type);
    else choose(type);
  }

  return (
    <>
      <div className="tiles">
        {HOME_TYPES.map((t) => (
          <button key={t} type="button" className="tile" aria-pressed={home.homeType === t} onClick={() => pick(t)}>
            <span className="tile-name">{t}</span>
            <span className="tile-rooms">{TEMPLATES[t].length} rooms</span>
          </button>
        ))}
      </div>
      {pending && (
        <InlineConfirm
          message={`Changing to ${pending} replaces the rooms you have edited.`}
          confirmLabel={`Change to ${pending}`}
          cancelLabel="Keep my rooms"
          onConfirm={() => choose(pending)}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
