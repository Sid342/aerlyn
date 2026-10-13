import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { GOALS } from '../../lib/goals.js';
import { roomSentence } from '../../lib/planSummary.js';
import { BookButton } from '../marketing/Booking.jsx';
import PlanNotice from '../savePlan/PlanNotice.jsx';
import ShareOptions from '../savePlan/ShareOptions.jsx';
import { PLATE_PATH } from '../../routes.js';
import HomeTypePicker from './HomeTypePicker.jsx';
import RoomList from './RoomList.jsx';
import Demo from './Demo.jsx';
import './Planner.css';

const PANELS = [['share', 'Save or share'], ['customise', 'Customise'], ['demo', 'See it in action']];

function GoalChips() {
  const { home, dispatch, actions } = useHome();
  return (
    <div className="chips" role="group" aria-label="What you want">
      {GOALS.map((g) => (
        <button key={g.id} type="button" className="chip" aria-pressed={home.goals.includes(g.id)} onClick={() => dispatch(actions.toggleGoal(g.id))}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {g.label}
        </button>
      ))}
    </div>
  );
}

// One tap on a home tile shows the plan right here; everything else is optional.
export default function Planner() {
  const { home } = useHome();
  const [panel, setPanel] = useState(null); // null | 'share' | 'customise' | 'demo'

  return (
    <section id="planner" className="section planner">
      <h2 className="section-title">What's your home?</h2>
      <HomeTypePicker />
      <PlanNotice />
      <p className="sr-only" role="status">{home.homeType ? `Your ${home.homeType} plan is below.` : ''}</p>

      {home.homeType && (
        <div className="plan">
          <div className="plan-head">
            <div>
              <h3>Your {home.homeType} plan</h3>
              <p>Like it? Book a free visit and we'll call you to fix a time.</p>
            </div>
            <BookButton />
          </div>

          <p className="plan-hint">Tap anything you don't need.</p>
          <GoalChips />

          <ul className="plan-lines">
            {home.rooms.map((room) => (
              <li key={room.id}>
                <span className="plan-room">{room.name}</span>
                <span className="plan-what">{roomSentence(room)}</span>
              </li>
            ))}
          </ul>

          <div className="plan-links">
            {PANELS.map(([id, label]) => (
              <button key={id} type="button" aria-expanded={panel === id} onClick={() => setPanel(panel === id ? null : id)}>{label}</button>
            ))}
            <a href={PLATE_PATH}>Design a switch plate</a>
          </div>

          {panel === 'share' && <div className="plan-panel"><ShareOptions /></div>}
          {panel === 'customise' && <div className="plan-panel"><RoomList /></div>}
          {panel === 'demo' && <div className="plan-panel"><Demo /></div>}
        </div>
      )}
    </section>
  );
}
