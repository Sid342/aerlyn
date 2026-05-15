import { useHome } from '../../context/HomeContext.jsx';
import { getDevice } from '../../data/devices.js';
import './HouseSvg.css';

function activeIcons(devices) {
  const on = devices.filter((d) => d.on);
  const icons = on.slice(0, 3).map((d) => {
    const meta = getDevice(d.deviceId);
    return meta ? meta.icon : null;
  }).filter(Boolean);
  const overflow = on.length > 3 ? on.length - 3 : 0;
  return { icons, overflow };
}

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
        role="img"
        aria-label="Your home overview"
      >
        <polyline className="house-roof" points={`10,60 ${width / 2},15 ${width - 10},60`} />
        {cells.map(({ room, x, y, w, h }) => {
          const onCount = room.devices.filter((d) => d.on).length;
          const isLit = isPlay && onCount > 0;
          const { icons, overflow } = activeIcons(room.devices);

          return (
            <g
              key={room.id}
              className="house-zone"
              onClick={() => isPlay && onRoomClick && onRoomClick(room.id)}
              style={{ cursor: isPlay ? 'pointer' : 'default' }}
            >
              <rect
                className={`house-zone-rect${isLit ? ' active' : ''}`}
                x={x} y={y} width={w} height={h} rx="6"
              />
              <text className="house-zone-label" x={x + 8} y={y + 16}>{room.name}</text>

              {isPlay && icons.length > 0 ? (
                <>
                  <text className="house-zone-icons" x={x + 8} y={y + 38}>
                    {icons.join(' ')}{overflow > 0 ? ` +${overflow}` : ''}
                  </text>
                  <text className="house-zone-on-label" x={x + 8} y={y + 56}>
                    {onCount} on — tap to control
                  </text>
                </>
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
            </g>
          );
        })}
      </svg>
    </div>
  );
}
