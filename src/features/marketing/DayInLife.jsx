import { useState } from 'react';
import './DayInLife.css';

const TIMELINE = [
  { time: '6:30 AM', icon: '🌅', moment: 'Waking Up', tagline: 'Your home wakes up before you do.', before: "Alarm blares. You fumble for your phone in a dark room. Drag yourself to the bathroom. Realise the geyser is cold — you forgot to turn it on 20 minutes ago. Start the day frazzled.", after: 'Your alarm triggers a "Good Morning" scene. Bedroom lights slowly brighten to cool white. The geyser switches on automatically. By the time you\'re brushed and ready, your hot water is waiting. The kitchen light is already on.', devices: [{ icon: '💡', label: 'Tunable white lights — gradual bright wake-up' }, { icon: '🚿', label: 'Smart geyser — auto-on 20 mins before alarm' }, { icon: '🎵', label: 'Smart speaker — plays your morning playlist' }] },
  { time: '8:00 AM', icon: '🚪', moment: 'Leaving for Work', tagline: 'One tap. Everything off. Everything secure.', before: "You're running late. Did you turn off the kitchen lights? Is the geyser still on? You can't remember. You're already in the lift. You go back up to check.", after: 'Tap "I\'m Leaving" on your phone. Every non-essential device switches off — lights, fans, geyser, sockets. The front door locks automatically. You get a confirmation on your phone before you\'ve even reached the ground floor.', devices: [{ icon: '🔒', label: 'Smart lock — auto-lock on leaving' }, { icon: '💡', label: 'All lights — off via leaving scene' }, { icon: '🔌', label: 'Smart sockets — non-essential loads cut' }] },
  { time: '10:00 PM', icon: '🌙', moment: 'Going to Bed', tagline: 'One scene. Perfect conditions. Every night.', before: "Room-to-room. Kitchen lights. Hall light. AC on. Fans on. Geyser off. Did you lock the door? Check the door. Back to bed. Still too bright.", after: 'Tap "Good Night". Every light turns off. Bedroom fan slows to sleep speed. AC sets to 24°C. Door locks. Cameras arm. You\'re asleep in minutes.', devices: [{ icon: '❄️', label: 'AC — auto-set to sleep temp' }, { icon: '💨', label: 'BLDC fan — low-speed sleep mode' }, { icon: '📷', label: 'Cameras — arm on Good Night scene' }] },
];

export default function DayInLife() {
  const [openIndex, setOpenIndex] = useState(null);
  function toggle(i) { setOpenIndex((prev) => (prev === i ? null : i)); }
  return (
    <section id="journey" className="dil-section">
      <div className="section-eyebrow" style={{ color: 'var(--teal)' }}>A day in your life — with Aerlyn</div>
      <h2 className="section-title">See how automation changes<br />every part of your day.</h2>
      <p className="section-body">From the moment your alarm goes off to the moment you fall asleep — your home handles everything so you don't have to.</p>
      <div className="dil-timeline">
        {TIMELINE.map((item, i) => (
          <div key={item.time} className="dil-item">
            <div className="dil-time-col">
              <div className="dil-time">{item.time}</div>
              {i < TIMELINE.length - 1 && <div className="dil-line" />}
            </div>
            <div className={`dil-card${openIndex === i ? ' open' : ''}`} onClick={() => toggle(i)}>
              <div className="dil-card-header">
                <span className="dil-card-icon">{item.icon}</span>
                <div><div className="dil-moment">{item.moment}</div><div className="dil-tagline">{item.tagline}</div></div>
                <span className="dil-chevron">▾</span>
              </div>
              <div className="dil-body">
                <div className="dil-before-after">
                  <div><div className="dil-ba-label before">Without Aerlyn</div><p>{item.before}</p></div>
                  <div><div className="dil-ba-label after">With Aerlyn</div><p>{item.after}</p></div>
                </div>
                <div className="dil-devices">
                  {item.devices.map((d) => (<div key={d.label} className="dil-device"><span>{d.icon}</span><span>{d.label}</span></div>))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
