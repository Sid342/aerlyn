import { useEffect, useState } from 'react';
import { submitLead } from '../../lib/submitLead.js';
import { validateContact } from '../../lib/validate.js';
import { whatsappUrl } from '../../config/site.js';
import { track } from '../../lib/track.js';
import { useDialog } from '../../lib/useDialog.js';
import './LeadModal.css';

// `product` is the product name when opened from a product page, so the lead says what the visitor was looking at.
export default function LeadModal({ phone: initialPhone, product, onClose }) {
  const [form, setForm] = useState({ name: '', phone: initialPhone || '', city: '', propertyType: '', timeline: '', notes: '', _gotcha: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'ok' | 'failed'

  const dialog = useDialog(true, onClose);

  // The form is replaced by the success message; keep focus inside the dialog.
  useEffect(() => {
    if (status === 'ok') dialog.current.focus();
  }, [status]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    const { errors: errs, phone } = validateContact(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const name = form.name.trim();
    const { ok } = await submitLead('visit', {
      Name: name, Phone: phone, Product: product, City: form.city, 'Property Type': form.propertyType, Timeline: form.timeline, Notes: form.notes,
      _subject: `New Home Visit Request — ${name} (${phone})${product ? ` — ${product}` : ''}`,
      _gotcha: form._gotcha,
    });
    setSubmitting(false);
    setStatus(ok ? 'ok' : 'failed');
    if (ok) track('visit_booked', { source: product ? 'product' : 'contact' });
  }

  const failed = status === 'failed';
  const waUrl = failed && whatsappUrl(`Hi Aerlyn, I'm ${form.name.trim()} and I'd like to book a free home visit.`);

  return (
    <div className="lead-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" ref={dialog} tabIndex={-1}>
        <h3 id="lead-modal-title">Book an appointment</h3>
        <p className="lead-modal-sub">We'll call you to schedule. No obligation.</p>
        {status === 'ok' ? (
          <div className="lead-success" role="status">
            ✓ Request received! We'll call you within 24 hours.
            <br />
            <button type="button" onClick={onClose} style={{ marginTop: 16, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Close</button>
          </div>
        ) : (
          <form className="lead-form" onSubmit={handleSubmit} noValidate>
            <input type="text" className="lead-input" placeholder="Your name *" aria-label="Your name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'lead-name-error' : undefined} value={form.name} onChange={(e) => set('name', e.target.value)} />
            {errors.name && <div id="lead-name-error" className="field-error" role="alert">{errors.name}</div>}
            <input type="tel" inputMode="tel" className="lead-input" placeholder="Phone number *" aria-label="Phone number" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'lead-phone-error' : undefined} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            {errors.phone && <div id="lead-phone-error" className="field-error" role="alert">{errors.phone}</div>}
            <input type="text" className="lead-input" placeholder="City / Area" aria-label="City or area" autoComplete="address-level2" value={form.city} onChange={(e) => set('city', e.target.value)} />
            <input className="hp-field" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form._gotcha} onChange={(e) => set('_gotcha', e.target.value)} />
            <select className="lead-input" aria-label="Property type" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
              <option value="" disabled>Property type</option>
              <option>1BHK Apartment</option><option>2BHK Apartment</option><option>3BHK Apartment</option>
              <option>4BHK+ Apartment</option><option>Independent House / Villa</option>
              <option>Office / Commercial</option><option>Under construction</option>
            </select>
            <select className="lead-input" aria-label="When are you looking to automate?" value={form.timeline} onChange={(e) => set('timeline', e.target.value)}>
              <option value="" disabled>When are you looking to automate?</option>
              <option>As soon as possible</option><option>Within a month</option>
              <option>1–3 months</option><option>Just exploring</option>
            </select>
            <textarea className="lead-input" rows={3} placeholder="Any specific problems or questions?" aria-label="Any specific problems or questions?" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            {failed && (
              <div className="field-error" role="alert">
                We couldn't send your request — your details are still here. Please try again.
                {waUrl && <> Or <a href={waUrl} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.</>}
              </div>
            )}
            <div className="lead-modal-actions">
              <button type="button" className="lead-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="lead-submit" disabled={submitting}>{submitting ? 'Sending…' : failed ? 'Try again' : 'Book an appointment'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
