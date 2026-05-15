import { MATERIAL_COLORS } from '../touchPlate/steps/StepMaterial.jsx';
import { MODULE_OPTIONS } from '../touchPlate/steps/StepModel.jsx';
import { ACCESSORIES } from '../touchPlate/steps/StepAccessories.jsx';

function isLight(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const FRAME_COLORS = {
  black: '#222',
  silver: '#aaa',
  white: '#ddd',
  gold: '#b8860b',
};

export function PlatePreview({ config, size = 120 }) {
  const materialCode = config.materialCode ?? '#888888';
  const maxSlots = MODULE_OPTIONS.find(m => m.label === config.model)?.maxSlots ?? 4;
  const textColor = isLight(materialCode) ? '#111' : '#eee';
  const frameColor = FRAME_COLORS[config.frame] ?? '#222';
  const height = size * 1.3;
  const slots = config.slots ?? [];

  const slotW = (size - 16) / maxSlots;

  return (
    <svg width={size} height={height} role="img" aria-label="Plate preview">
      {/* Plate background */}
      <rect
        x={4}
        y={4}
        width={size - 8}
        height={height - 8}
        rx={6}
        fill={materialCode}
        stroke={frameColor}
        strokeWidth={3}
      />

      {slots.length === 0 ? (
        <text
          x={size / 2}
          y={height * 0.5}
          fontSize={10}
          fill={textColor}
          opacity={0.4}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          No slots
        </text>
      ) : (
        slots.map((slot, i) => {
          const x = 8 + i * slotW + 2;
          const y = size * 0.3;
          const w = slotW - 4;
          const h = size * 0.55;
          const cx = x + w / 2;
          return (
            <g key={slot.id != null ? `${slot.id}-${i}` : i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={4}
                fill={textColor}
                fillOpacity={0.15}
                stroke={textColor}
                strokeOpacity={0.5}
                strokeWidth={1}
              />
              <text
                x={cx}
                y={y + h + 12}
                fontSize={8}
                fill={textColor}
                textAnchor="middle"
              >
                {slot.name.slice(0, 6)}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}
