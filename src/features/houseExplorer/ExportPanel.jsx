import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { downloadJson } from '../../lib/exportJson.js';
import { downloadPdf } from '../../lib/exportPdf.js';
import { sendToAerlyn } from '../../lib/sendFormspree.js';
import './ExportPanel.css';

export default function ExportPanel() {
  const { home } = useHome();
  const [contact, setContact] = useState({ name: '', phone: '', city: '', notes: '' });
  const [status, setStatus] = useState(null); // { ok: boolean, msg: string }
  const [sending, setSending] = useState(false);

  if (!home.homeType) return null;

  function set(field) {
    return (e) => setContact((c) => ({ ...c, [field]: e.target.value }));
  }

  async function emailOrder() {
    setSending(true);
    setStatus(null);
    try {
      const ok = await sendToAerlyn(home, contact);
      setStatus(
        ok
          ? { ok: true, msg: 'Sent to Aerlyn.' }
          : { ok: false, msg: 'Send failed. Try downloading instead.' }
      );
    } catch {
      setStatus({ ok: false, msg: 'Network error. Try downloading the file instead.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card export-panel">
      <h3>3. Place the order</h3>
      <p style={{ color: 'var(--text-dim)' }}>
        Download the plan, or send it straight to Aerlyn.
      </p>

      <div className="export-fields">
        <input aria-label="Customer name" placeholder="Customer name" value={contact.name} onChange={set('name')} />
        <input aria-label="Phone" placeholder="Phone" value={contact.phone} onChange={set('phone')} />
        <input aria-label="City" placeholder="City" value={contact.city} onChange={set('city')} />
        <textarea aria-label="Notes" placeholder="Notes (optional)" value={contact.notes} onChange={set('notes')} />
      </div>

      <div className="export-actions">
        <button type="button" className="btn-secondary" onClick={() => downloadJson(home)}>
          Download JSON
        </button>
        <button type="button" className="btn-secondary" onClick={() => downloadPdf(home)}>
          Download PDF
        </button>
        <button type="button" className="btn-primary" onClick={emailOrder} disabled={sending}>
          {sending ? 'Sending…' : 'Send to Aerlyn'}
        </button>
      </div>

      {status && (
        <div
          role={status.ok ? 'status' : 'alert'}
          className={`export-status ${status.ok ? 'ok' : 'err'}`}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}
