import { PLATE_ICON_CATEGORIES } from '../../data/plateIconLibrary.js';

// The reference's icon library: drag an icon onto a switch, or pick a switch and then an icon.
// One tab stop; the arrow keys move between icons. The tiles are not <button>s because browsers
// do not start a drag from a button.
export default function IconPalette({ onPick }) {
  function onKeyDown(e) {
    const icons = [...e.currentTarget.querySelectorAll('.tpd-palette-icon')];
    const at = icons.indexOf(document.activeElement);
    if (at < 0) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      icons[at].click();
      return;
    }
    const columns = getComputedStyle(icons[at].parentElement).gridTemplateColumns.split(' ').length;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[e.key];
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? icons.length - 1 : at + (step ?? NaN);
    if (!icons[to]) return;
    e.preventDefault();
    icons[at].tabIndex = -1;
    icons[to].tabIndex = 0;
    icons[to].focus();
  }

  return (
    <div className="tpd-palette" onKeyDown={onKeyDown}>
      {PLATE_ICON_CATEGORIES.map((category, c) => (
        <div key={category.id} role="group" aria-label={category.label}>
          <div className="tpd-palette-title">{category.label}</div>
          <div className="tpd-palette-grid">
            {category.icons.map((icon, i) => (
              <div
                role="button"
                key={icon.id}
                className="tpd-palette-icon"
                title={icon.label}
                aria-label={icon.label}
                tabIndex={c === 0 && i === 0 ? 0 : -1}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', icon.id)}
                onClick={() => onPick(icon.id)}
              >
                <img src={`/plate-icons/${icon.file}`} alt="" width="48" height="48" loading="lazy" draggable={false} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
