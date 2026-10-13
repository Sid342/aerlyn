import { useState } from 'react';
import './DeviceInfo.css';

export default function DeviceInfo({ blurb }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="device-info" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="device-info-btn" type="button" aria-label="What this does" aria-expanded={open} onClick={() => setOpen((o) => !o)} onBlur={() => setOpen(false)}>
        <span aria-hidden="true">i</span>
      </button>
      {open && <span className="device-info-pop" role="status">{blurb}</span>}
    </span>
  );
}
