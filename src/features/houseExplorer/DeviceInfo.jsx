import { useState } from 'react';
import './DeviceInfo.css';

export default function DeviceInfo({ blurb }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="device-info"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button
        className="device-info-btn"
        type="button"
        aria-label="What this enables"
        onClick={() => setOpen((o) => !o)}
      >i</button>
      {open && <span className="device-info-pop">{blurb}</span>}
    </span>
  );
}
