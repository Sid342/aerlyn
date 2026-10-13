import { useEffect, useRef, useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { PLATE_MODELS, PLATE_MATERIALS, PLATE_SIZES } from '../../data/plateCatalogue.js';
import { emptyPlateConfig, cleanPlateConfig, plateSteps, accessoriesFor, coloursFor, plateButtons } from '../../lib/plateConfig.js';
import { plateIcon } from '../../data/plateIconLibrary.js';
import Plate from './Plate.jsx';
import IconPalette from './IconPalette.jsx';
import PlateSummary from './PlateSummary.jsx';
import './TouchPlateDesigner.css';

// What a step needs before Next works, as in the reference.
const REQUIRED = { model: 'a model', material: 'a material', size: 'a size' };
// the step survives a reload of the tab (the choices themselves are saved with the plan)
const STEP_KEY = 'aerlyn_plate_step';
function storedStep() {
  try {
    return Number(sessionStorage.getItem(STEP_KEY)) || 0;
  } catch {
    return 0;
  }
}

// index of the first step whose choice has not been made, or -1
const openStep = (config, steps) => steps.findIndex((s) => REQUIRED[s.id] && config[s.id] == null);

function Cards({ label, options, value, onPick }) {
  return (
    <div className="tpd-cards" role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <button type="button" key={o.id} role="radio" aria-checked={value === o.id} aria-label={o.label} className="tpd-card" onClick={() => onPick(o.id)}>
          <span className="tpd-card-kicker">{label} {i + 1}</span>
          <span className="tpd-card-name">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Swatches({ title, colours, value, onPick }) {
  return (
    <>
      <h3 className="tpd-side-title">{title}</h3>
      <div className="tpd-swatches" role="radiogroup" aria-label={title}>
        {colours.map((c) => (
          <button type="button" key={c.id} role="radio" aria-checked={value === c.id} className="tpd-swatch" onClick={() => onPick(c.id)}>
            <span className="tpd-swatch-chip" style={{ backgroundColor: c.code }} />
            {c.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function TouchPlateDesigner() {
  const { home, dispatch, actions } = useHome();
  const config = home.plateConfig;
  const steps = plateSteps(config);
  const [step, setStep] = useState(storedStep);
  const [selected, setSelected] = useState(null); // key of the switch being given an icon
  const [notice, setNotice] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [logo, setLogo] = useState(null); // { src, position } — kept in memory only
  const heading = useRef(null);

  // opened from a room's switch plan: start at the first thing still to choose
  useEffect(() => {
    if (!home.plateOpens) return;
    const open = openStep(config, steps);
    setStep(open < 0 ? steps.findIndex((s) => s.id === 'accessories') : open);
  }, [home.plateOpens]);

  if (!home.homeType) return null;

  const setConfig = (next) => dispatch(actions.setPlateConfig(cleanPlateConfig(next)));
  const plateRoom = home.rooms.find((r) => r.id === home.plateRoomId);
  // a step can vanish (Frame, when the model changes) or lose what it needs (a plan loaded over this one)
  const open = openStep(config, steps);
  const at = Math.min(step, steps.length - 1, open < 0 ? steps.length : open);
  const id = steps[at].id;
  const missing = REQUIRED[id] && config[id] == null ? REQUIRED[id] : null;
  const buttons = plateButtons(config);
  const current = buttons.find((b) => b.key === selected) || buttons[0] || null;
  const offered = accessoriesFor(config);

  function go(to) {
    setStep(to);
    try {
      sessionStorage.setItem(STEP_KEY, to);
    } catch { /* private mode: the step just will not survive a reload */ }
    setNotice(null);
    setConfirmReset(false);
    heading.current?.focus();
  }

  function pickAccessory(accessoryId) {
    // the reference takes one accessory per plate and wants it removed before another is placed;
    // Snap On plates simply swap
    if (config.accessory && config.model !== 'snap-on') {
      setNotice('A plate takes one accessory. To change it, first remove the one on the plate with the bin under it.');
      return;
    }
    setNotice(null);
    setConfig({ ...config, accessory: accessoryId, icons: {} });
  }

  function setIcon(key, iconId) {
    const icons = { ...config.icons };
    if (iconId) icons[key] = iconId;
    else delete icons[key];
    setConfig({ ...config, icons });
  }

  // click path: the icon goes on the selected switch and the selection moves on to the next one
  function pickIcon(iconId) {
    if (!current) return;
    setIcon(current.key, iconId);
    const next = buttons[buttons.indexOf(current) + 1];
    setSelected(next ? next.key : current.key);
  }

  function reset() {
    setConfig(emptyPlateConfig);
    setLogo(null);
    setSelected(null);
    go(0);
  }

  const edit = id === 'icons' ? { selected: current && current.key, onSelect: setSelected, onIcon: setIcon } : null;
  const plate = (
    <div className="tpd-stage">
      <Plate config={config} edit={edit} logo={logo} onRemove={id === 'accessories' ? () => setConfig({ ...config, accessory: null, icons: {} }) : null} />
    </div>
  );

  function body() {
    switch (id) {
      case 'model':
        return <Cards label="Model" options={PLATE_MODELS} value={config.model} onPick={(model) => setConfig({ ...config, model })} />;
      case 'material':
        return <Cards label="Material" options={PLATE_MATERIALS} value={config.material} onPick={(material) => setConfig({ ...config, material })} />;
      case 'size':
        return (
          <>
            <Cards
              label="Size"
              options={PLATE_SIZES.map((n) => ({ id: n, label: `${n} module` }))}
              value={config.size}
              // as in the reference, a new size clears the accessory and its icons
              onPick={(size) => setConfig({ ...config, size, accessory: null, icons: {} })}
            />
            {config.size && plate}
          </>
        );
      case 'accessories':
        return (
          <div className="tpd-split">
            <div className="tpd-side">
              <h3 className="tpd-side-title">{config.size} module</h3>
              {offered.length === 0 && <p className="tpd-hint">This model has no accessories in this size. Go back and pick another size.</p>}
              <div className="tpd-accessories">
                {offered.map((a) => (
                  <button type="button" key={a.id} className="tpd-accessory" aria-pressed={config.accessory === a.id} onClick={() => pickAccessory(a.id)}>
                    {a.name.replace(/-/g, '\u2011')}
                  </button>
                ))}
              </div>
              {notice && <p className="tpd-notice" role="status">{notice}</p>}
            </div>
            {plate}
          </div>
        );
      case 'icons':
        return (
          <div className="tpd-split">
            <div className="tpd-side">
              <h3 className="tpd-side-title">Select icons</h3>
              {current ? (
                <>
                  <p className="tpd-hint">
                    Drag an icon onto a switch, or pick a switch on the plate and then an icon.
                  </p>
                  <p className="tpd-current">
                    <span>Switch {current.n}: <strong>{current.icon ? plateIcon(current.icon).label : 'no icon'}</strong></span>
                    <button type="button" className="tpd-link" disabled={!current.icon} onClick={() => setIcon(current.key, null)}>Remove icon</button>
                  </p>
                  <IconPalette onPick={pickIcon} />
                </>
              ) : (
                <p className="tpd-hint">
                  {config.accessory ? 'This accessory has no switches that take an icon.' : 'Go back and choose an accessory first. Icons go on its switches.'}
                </p>
              )}
            </div>
            {plate}
          </div>
        );
      case 'panel':
      case 'frame':
        return (
          <div className="tpd-split">
            <div className="tpd-side">
              <Swatches
                title={id === 'panel' ? 'Panel colour' : 'Frame colour'}
                colours={coloursFor(config)}
                // until one is picked the panel is black, as in the reference
                value={config[id] ?? (id === 'panel' ? 'black' : null)}
                onPick={(colour) => setConfig({ ...config, [id]: colour })}
              />
            </div>
            {plate}
          </div>
        );
      default:
        return (
          <PlateSummary
            config={config}
            roomName={plateRoom ? plateRoom.name : null}
            logo={logo}
            onLogo={setLogo}
            onRemote={(remote) => setConfig({ ...config, remote })}
          />
        );
    }
  }

  return (
    <div className="tpd" id="plate-designer">
      <div className="tpd-head">
        <div>
          <h2>{plateRoom ? `Switch plate for your ${plateRoom.name}` : 'Design a switch plate'}</h2>
          <p className="tpd-sub">Choose the plate, its switches, icons and colours. This is optional.</p>
        </div>
        <div className="tpd-reset">
          {confirmReset ? (
            <>
              <span role="status">Clear all your choices?</span>
              <button type="button" className="tpd-btn danger" onClick={reset}>Yes, reset</button>
              <button type="button" className="tpd-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className="tpd-btn" onClick={() => setConfirmReset(true)}>Start again</button>
          )}
        </div>
      </div>

      <ol className="tpd-stepper">
        {steps.map((s, i) => (
          <li key={s.id} className={`tpd-step${i === at ? ' active' : ''}${i < at ? ' done' : ''}`}>
            <button type="button" aria-current={i === at ? 'step' : undefined} disabled={i >= at} onClick={() => go(i)}>
              <span className="tpd-step-dot" aria-hidden="true">
                {i < at ? <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : i + 1}
              </span>
              <span className="tpd-step-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* Back and Next live here on every step, so they never move with the height of the step */}
      <div className="tpd-bar">
        <h3 className="tpd-step-title" ref={heading} tabIndex={-1}>{steps[at].label}</h3>
        <div className="tpd-nav">
          {missing && <span className="tpd-nav-hint">Choose {missing} to continue.</span>}
          <button type="button" className="tpd-btn" onClick={() => go(at - 1)} disabled={at === 0}>Back</button>
          {at < steps.length - 1
            ? <button type="button" className="tpd-btn primary" onClick={() => go(at + 1)} disabled={!!missing}>Next</button>
            : <span className="tpd-nav-gap" aria-hidden="true" /> /* the last step has no Next; Back stays where it was */}
        </div>
      </div>
      <div className="tpd-body">{body()}</div>
    </div>
  );
}
