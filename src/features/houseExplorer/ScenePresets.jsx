import { SCENES } from '../../data/scenes.js';
import { useHome } from '../../context/HomeContext.jsx';
import './ScenePresets.css';

export default function ScenePresets({ roomId = null }) {
  const { home, dispatch, actions } = useHome();
  if (!home.homeType || home.mode !== 'play') return null;

  function handleScene(deviceStates) {
    if (roomId) {
      dispatch(actions.applySceneToRoom(roomId, deviceStates));
    } else {
      dispatch(actions.applyScene(deviceStates));
    }
  }

  return (
    <div className="scene-strip">
      {!roomId && <div className="scene-strip-label">Set whole home:</div>}
      <div className="scene-pills">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="scene-btn"
            onClick={() => handleScene(s.deviceStates)}
          >
            <span className="scene-icon">{s.icon}</span>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
