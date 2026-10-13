import { useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { buildExportPayload, downloadJson } from '../../lib/exportJson.js';
import { downloadPdf } from '../../lib/exportPdf.js';
import { submitLead } from '../../lib/submitLead.js';
import { validateContact } from '../../lib/validate.js';
import { whatsappUrl } from '../../config/site.js';
import './ExportPanel.css';

export default function ExportPanel() {
  const { home } = useHome();
  const [contact, setContact] = useState({ name: '', phone: '', city: '', notes: '', _gotcha: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { ok: boolean, msg: string }
  const [sending, setSending] = useState(false);

  if (!home.homeType) return null;

  function set(field) {
    return (e) => setContact((c) => ({ ...c, [field]: e.target.value }));
  }

  async function emailOrder() {
    const { errors: errs, phone } = validateContact(contact);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    setStatus(null);
    const payload = buildExportPayload(home);
    const { ok } = await submitLead('plan', {
      _subject: `Aerlyn Studio plan — ${payload.homeType} — ${contact.name.trim()} (${phone})`,
      customerName: contact.name.trim(),
      customerPhone: phone,
      customerCity: contact.city,
      notes: contact.notes,
      plan: JSON.stringify(payload, null, 2),
      _gotcha: contact._gotcha,
    });
    setSending(false);
    setStatus(
      ok
        ? { ok: true, msg: 'Sent to Aerlyn.' }
        : { ok: false, msg: 'Send failed — your details are still here. Please try again.' }
    );
  }

  const failed = status && !status.ok;
  const waUrl = failed && whatsappUrl(`Hi Aerlyn, I'm ${contact.name.trim()} and I'd like a quote for my ${home.homeType} plan.`);

  return (
    <div className="card export-panel">
      <h3>3. Place the order</h3>
      <p style={{ color: 'var(--text-dim)' }}>
        Download the plan, or send it straight to Aerlyn.
      </p>

      <div className="export-fields">
        <div>
          <input aria-label="Customer name" placeholder="Customer name *" autoComplete="name" value={contact.name} onChange={set('name')} aria-invalid={!!errors.name} />
          {errors.name && <div className="field-error" role="alert">{errors.name}</div>}
        </div>
        <div>
          <input type="tel" inputMode="tel" aria-label="Phone" placeholder="Phone *" autoComplete="tel" value={contact.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
          {errors.phone && <div className="field-error" role="alert">{errors.phone}</div>}
        </div>
        <input aria-label="City" placeholder="City" value={contact.city} onChange={set('city')} />
        <input className="hp-field" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" value={contact._gotcha} onChange={set('_gotcha')} />
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
          {sending ? 'Sending…' : failed ? 'Try again' : 'Send to Aerlyn'}
        </button>
      </div>

      {status && (
        <div
          role={status.ok ? 'status' : 'alert'}
          className={`export-status ${status.ok ? 'ok' : 'err'}`}
        >
          {status.msg}
          {waUrl && <> Or <a href={waUrl} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.</>}
        </div>
      )}
    </div>
  );
}
