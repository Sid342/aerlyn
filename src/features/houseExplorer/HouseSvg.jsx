import { useHome } from '../../context/HomeContext.jsx';
import './HouseSvg.css';

function layout(rooms) {
  const cols = rooms.length <= 4 ? 2 : 3;
  const cellW = 120;
  const cellH = 80;
  const gap = 10;
  return rooms.map((room, i) => ({
    room,
    x: 20 + (i % cols) * (cellW + gap),
    y: 70 + Math.floor(i / cols) * (cellH + gap),
    w: cellW,
    h: cellH,
  }));
}

export default function HouseSvg({ onRoomClick }) {
  const { home } = useHome();
  if (!home.homeType || home.rooms.length === 0) return null;

  const cells = layout(home.rooms);
  const cols = home.rooms.length <= 4 ? 2 : 3;
  const rows = Math.ceil(home.rooms.length / cols);
  const width = 20 + cols * 130 + 10;
  const height = 70 + rows * 90 + 20;
  const isPlay = home.mode === 'play';

  return (
    <div className="house-svg-wrap card">
      <svg
        className="house-svg"
        viewBox={`0 0 ${width} ${height}`}
        role={isPlay ? 'group' : 'img'}
        aria-label="Your home overview"
      >
        <polyline className="house-roof" points={`10,60 ${width / 2},15 ${width - 10},60`} />
        {cells.map(({ room, x, y, w, h }) => {
          const onCount = room.devices.filter((d) => d.on).length;
          const isLit = isPlay && onCount > 0;

          // In Play mode a zone is a real link (to its room card) that opens the room's controls.
          const Zone = isPlay ? 'a' : 'g';
          const zoneProps = isPlay
            ? {
                href: `#room-${room.id}`,
                'aria-label': `Control ${room.name}`,
                onClick: (e) => { e.preventDefault(); onRoomClick?.(room.id); },
              }
            : {};

          return (
            <Zone key={room.id} className="house-zone" {...zoneProps}>
              <rect
                className={`house-zone-rect${isLit ? ' active' : ''}`}
                x={x} y={y} width={w} height={h} rx="6"
              />
              <text className="house-zone-label" x={x + 8} y={y + 16}>{room.name}</text>

              {isLit ? (
                <text className="house-zone-on-label" x={x + 8} y={y + 34}>{onCount} on. Tap to control.</text>
              ) : (
                <text className="house-zone-label" x={x + 8} y={y + 34}>
                  {room.devices.length} devices
                </text>
              )}

              <circle
                className={`house-dot${isLit ? ' lit' : ' ambient'}`}
                cx={x + w - 14}
                cy={y + 14}
                r="4"
              />
            </Zone>
          );
        })}
      </svg>
    </div>
  );
}
