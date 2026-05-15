import { useHome } from '../../context/HomeContext.jsx';
import './ModeToggle.css';

export default function ModeToggle() {
  const { home, dispatch, actions } = useHome();
  if (!home.homeType) return null;

  return (
    <div style={{ margin: '14px 0' }}>
      <div className="mode-toggle">
        <button
          type="button"
          className={home.mode === 'build' ? 'active' : ''}
          aria-pressed={home.mode === 'build'}
          onClick={() => dispatch(actions.setMode('build'))}
        >
          Build
        </button>
        <button
          type="button"
          className={home.mode === 'play' ? 'active' : ''}
          aria-pressed={home.mode === 'play'}
          onClick={() => dispatch(actions.setMode('play'))}
        >
          Play
        </button>
      </div>
      <div className="mode-hint">
        {home.mode === 'build'
          ? 'Build mode — add, remove and count the devices in each room.'
          : 'Play mode — tap devices on and off to see automation in action.'}
      </div>
    </div>
  );
}
