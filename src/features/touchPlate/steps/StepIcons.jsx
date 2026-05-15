const SWITCH_ICONS = ['💡', '🌡️', '🔌', '🎵', '📺', '❄️', '💧', '🔒', '🔆', '🌙', '⬆️', '⬇️', '🔁', '🌿'];

export default function StepIcons({ config, onChange }) {
  const switches = config.accessories.filter((a) =>
    a.name.toLowerCase().includes('switch') || a.name.toLowerCase().includes('fan')
  );

  if (switches.length === 0) {
    return (
      <div>
        <div className="tpd-section-label">Icons</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          No switch accessories placed — skip this step.
        </p>
      </div>
    );
  }

  function setIcon(accId, icon) {
    const current = config.icons[accId];
    onChange({
      ...config,
      icons: { ...config.icons, [accId]: current === icon ? null : icon },
    });
  }

  return (
    <div>
      <div className="tpd-section-label">Assign icons to accessories</div>
      {switches.map((sw) => (
        <div key={sw.id} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--fg)', marginBottom: 8 }}>{sw.name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SWITCH_ICONS.map((icon) => (
              <button
                type="button"
                key={icon}
                aria-pressed={config.icons[sw.id] === icon}
                onClick={() => setIcon(sw.id, icon)}
                style={{
                  fontSize: '1.3rem',
                  background: 'var(--card)',
                  border: `2px solid ${config.icons[sw.id] === icon ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
