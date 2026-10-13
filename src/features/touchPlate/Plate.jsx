import { useLayoutEffect, useRef, useState } from 'react';
import { plateAccessory, platePanels, plateButtons, plateColour, hasFrame, hasBorder, isLightPanel } from '../../lib/plateConfig.js';
import { plateIcon, plateIconSrc } from '../../data/plateIconLibrary.js';

const REFERENCE_SCALE = 0.75; // the reference always shows the plate at 75%
const DRAG_TYPE = 'text/plain';

// Snap On plates are drawn from millimetre coordinates, at the reference's 3.78 px per mm.
const mm = (v) => `${v * 3.78}px`;
const circle = (el, size) => ({ position: 'absolute', left: mm(el.cx - size / 2), top: mm(el.cy - size / 2), width: mm(size), height: mm(size) });

// Props for a button that takes an icon. `edit` is { selected, onSelect, onIcon } on the Icons step, else null.
function buttonProps(button, edit) {
  if (!edit) return {};
  const icon = button.icon && plateIcon(button.icon);
  return {
    role: 'button',
    tabIndex: 0,
    'aria-pressed': edit.selected === button.key,
    'aria-label': `Switch ${button.n}, ${icon ? icon.label : 'no icon'}`,
    onClick: () => edit.onSelect(button.key),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        edit.onSelect(button.key);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        edit.onIcon(button.key, null);
      }
    },
    onDragOver: (e) => e.preventDefault(),
    // both must be cancelled for the drop to be allowed
    onDragEnter: (e) => {
      e.preventDefault();
      e.currentTarget.classList.add('tpd-over');
    },
    onDragLeave: (e) => e.currentTarget.classList.remove('tpd-over'),
    onDrop: (e) => {
      e.preventDefault();
      e.currentTarget.classList.remove('tpd-over');
      const id = e.dataTransfer.getData(DRAG_TYPE);
      if (plateIcon(id)) edit.onIcon(button.key, id);
    },
  };
}

const marks = (button, edit) => `${button.icon ? ' tpd-has-icon' : ''}${edit && edit.selected === button.key ? ' tpd-selected' : ''}`;

// Unlike the reference (7 mm artwork in a 12 mm ring), a placed icon fills the ring it replaces.
function Icon({ id }) {
  return id ? <img className="tpd-icon" src={plateIconSrc(id)} alt="" draggable={false} /> : null;
}

function Bin() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
    </svg>
  );
}

function SnapOnSurface({ accessory, buttons, edit }) {
  return (
    <div className="snapon-scale" style={{ width: '100%', height: '100%' }}>
      <div className="snapon-surface" style={{ position: 'relative', width: mm(accessory.panel.w), height: mm(accessory.panel.h) }}>
        {accessory.elements.map((el, i) => {
          const button = buttons.get(`s${i}`);
          if (button) {
            return (
              <div key={i} className={`snapon-btn${marks(button, edit)}`} style={circle(el, 12)} {...buttonProps(button, edit)}>
                <div className="snapon-btn-svg"><Icon id={button.icon} /></div>
              </div>
            );
          }
          if (el.type === 'socket-big-circle') return <div key={i} className="snapon-static-circle socket-big" style={circle(el, 13)} />;
          if (el.type === 'socket-small-circle') return <div key={i} className="snapon-static-circle socket-small" style={circle(el, 7)} />;
          if (el.type === 'socket-earth-pin') {
            return <div key={i} className="snapon-earth-pin" style={{ position: 'absolute', left: mm(el.cx - 3.5), top: mm(el.cy - 3), width: mm(7), height: mm(6) }} />;
          }
          return <div key={i} className="snapon-static-circle" style={circle(el, 10)} />;
        })}
      </div>
    </div>
  );
}

// The plate, in the reference's own markup and classes. `logo` is { src, position } or null.
// `onRemove` adds the reference's bin under the accessory. `plateRef` receives the plate element so it
// can be rasterised for the PDF.
export default function Plate({ config, edit = null, logo = null, onRemove = null, plateRef }) {
  const stage = useRef(null);
  const own = useRef(null);
  const plate = plateRef || own;
  const [fit, setFit] = useState(null); // { scale, width, height } once measured

  // The reference shows the plate at 75%; here it also shrinks to the width that is available.
  useLayoutEffect(() => {
    if (!plate.current) return undefined;
    const measure = () => {
      const { offsetWidth: w, offsetHeight: h } = plate.current;
      const scale = Math.min(REFERENCE_SCALE, stage.current.clientWidth / w);
      setFit((f) => (f && f.scale === scale && f.width === w * scale ? f : { scale, width: w * scale, height: h * scale }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [config.size, plate]);

  if (!config.size) return null;
  const accessory = plateAccessory(config);
  const snapOn = config.model === 'snap-on';
  const buttons = new Map(plateButtons(config).map((b) => [b.key, b]));
  const panel = plateColour(config.panel);
  const frame = hasFrame(config) && plateColour(config.frame);
  const corner = logo && logo.position.split('-'); // 'top-left' -> top: 10, left: 10

  return (
    <div className={`tpd-ref${isLightPanel(config) ? ' tpd-light' : ''}`} ref={stage}>
      <div className="tpd-fit" style={fit ? { width: fit.width, height: fit.height } : { visibility: 'hidden' }}>
        <div
          ref={plate}
          className={`module-display module-${config.size} module-black ${hasBorder(config) ? 'module-fsilver' : 'border-none'}`}
          style={{
            boxShadow: '0 0 10px #888',
            borderRadius: 10,
            overflow: 'hidden',
            transform: `scale(${fit ? fit.scale : REFERENCE_SCALE})`,
            ...(panel ? { backgroundColor: panel.code } : {}),
            ...(frame ? { border: `5px solid ${frame.code}` } : {}),
          }}
        >
          {logo && <img className="tpd-logo" src={logo.src} alt="Logo" style={{ [corner[0]]: 10, [corner[1]]: 10 }} />}
          {snapOn ? (
            accessory && <SnapOnSurface accessory={accessory} buttons={buttons} edit={edit} />
          ) : (
            <div className={`sub-module-${config.size}`}>
              {accessory && (
                <div style={{ position: 'relative' }}>
                  <div style={{ height: '100%' }}>
                    {platePanels(config).map((nodes, p) => (
                      <div key={p} className={accessory.className}>
                        {nodes.map((node) => (
                          <div key={node.id} className="nodeSize">
                            {node.subs.map((sub, s) => {
                              const button = buttons.get(sub.key);
                              return (
                                <div key={s} className={sub.className + (button ? marks(button, edit) : '')} {...(button ? buttonProps(button, edit) : {})}>
                                  <div className="node-icon">{button && <Icon id={button.icon} />}</div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                    {onRemove && (
                      <button type="button" className="tpd-bin" aria-label={`Remove ${accessory.name}`} title="Remove accessory" onClick={onRemove}>
                        <Bin />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
