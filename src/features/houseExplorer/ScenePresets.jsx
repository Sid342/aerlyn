import { SCENES } from '../../data/scenes.js';
import { useHome } from '../../context/HomeContext.jsx';
import './ScenePresets.css';

export default function ScenePresets() {
  const { home, dispatch, actions } = useHome();
  if (!home.homeType || home.mode !== 'play') return null;

  return (
    <div>
      <div className="mode-hint">Try a scene — one tap sets the whole home:</div>
      <div className="scene-presets">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="scene-btn"
            onClick={() => dispatch(actions.applyScene(s.deviceStates))}
          >
            <span className="scene-icon">{s.icon}</span>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
