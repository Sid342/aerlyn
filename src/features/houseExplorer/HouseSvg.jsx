import { useHome } from '../../context/HomeContext.jsx';
import './HouseSvg.css';

function layout(rooms) {
  const cols = rooms.length <= 4 ? 2 : 3;
  const cellW = 120;
  const cellH = 70;
  const gap = 10;
  return rooms.map((room, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      room,
      x: 20 + col * (cellW + gap),
      y: 70 + row * (cellH + gap),
      w: cellW,
      h: cellH,
    };
  });
}

export default function HouseSvg() {
  const { home } = useHome();
  if (!home.homeType || home.rooms.length === 0) return null;

  const cells = layout(home.rooms);
  const cols = home.rooms.length <= 4 ? 2 : 3;
  const rows = Math.ceil(home.rooms.length / cols);
  const width = 20 + cols * 130 + 10;
  const height = 70 + rows * 80 + 20;
  const isPlay = home.mode === 'play';

  function focusRoom(roomId) {
    const el = document.getElementById(`room-${roomId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="house-svg-wrap card">
      <svg
        className="house-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Your home overview"
      >
        <polyline className="house-roof" points={`10,60 ${width / 2},15 ${width - 10},60`} />
        {cells.map(({ room, x, y, w, h }) => {
          const onCount = room.devices.filter((d) => d.on).length;
          const isLit = isPlay && onCount > 0;
          return (
            <g key={room.id} className="house-zone" onClick={() => focusRoom(room.id)}>
              <rect
                className={`house-zone-rect${isLit ? ' active' : ''}`}
                x={x} y={y} width={w} height={h} rx="6"
              />
              <text className="house-zone-label" x={x + 8} y={y + 18}>
                {room.name}
              </text>
              <text className="house-zone-label" x={x + 8} y={y + 32}>
                {room.devices.length} devices
              </text>
              {isPlay && onCount > 0 && (
                <text className="house-zone-on-label" x={x + 8} y={y + 46}>
                  {onCount} on
                </text>
              )}
              <circle
                className={`house-dot${isLit ? ' lit' : ' ambient'}`}
                cx={x + w - 14}
                cy={y + 14}
                r="4"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
