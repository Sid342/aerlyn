import { SCENES } from '../../data/scenes.js';
import { DEVICES } from '../../data/devices.js';
import { useHome } from '../../context/HomeContext.jsx';
import { roomSentence } from '../../lib/planSummary.js';

const ALL_OFF = Object.fromEntries(DEVICES.map((d) => [d.id, false]));

// Tap a scene and the rooms of the house light up with what it switches on.
export default function Demo() {
  const { home, dispatch, actions } = useHome();
  const anyOn = home.rooms.some((r) => r.devices.some((d) => d.on));

  return (
    <div className="demo">
      <p className="plan-hint">A scene sets several things with one tap. Try one.</p>
      <div className="demo-scenes">
        {[...SCENES, ...home.customScenes].map((s) => (
          <button key={s.id} type="button" className="btn quiet" onClick={() => dispatch(actions.applyScene({ ...ALL_OFF, ...s.deviceStates }))}>{s.name}</button>
        ))}
        <button type="button" className="btn quiet demo-off" disabled={!anyOn} onClick={() => dispatch(actions.applyScene(ALL_OFF))}>All off</button>
      </div>
      <div className="house" aria-live="polite">
        <svg className="house-roof" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,12 50,1 100,12" /></svg>
        <ul className="house-rooms">
          {home.rooms.map((room) => {
            const on = room.devices.filter((d) => d.on);
            return (
              <li key={room.id} className={on.length ? 'lit' : undefined}>
                <span className="house-room">{room.name}</span>
                <span className="house-on">{on.length ? `${roomSentence({ devices: on })} on` : 'Off'}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
