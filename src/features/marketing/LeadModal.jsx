import { useState } from 'react';
import './LeadModal.css';

const FORMSPREE = 'https://formspree.io/f/mykokrdw';

export default function LeadModal({ phone: initialPhone, onClose }) {
  const [form, setForm] = useState({ name: '', phone: initialPhone || '', city: '', propertyType: '', timeline: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) { alert('Please enter your name and phone number.'); return; }
    setSubmitting(true);
    try {
      await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ Name: form.name, Phone: form.phone, City: form.city, 'Property Type': form.propertyType, Timeline: form.timeline, Notes: form.notes, _subject: `New Home Visit Request — ${form.name} (${form.phone})` }),
      });
      setSuccess(true);
    } catch { alert('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="lead-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lead-modal">
        <h3>Book your free home visit</h3>
        <p className="lead-modal-sub">We'll call you to schedule. No obligation.</p>
        {success ? (
          <div className="lead-success">
            ✓ Request received! We'll call you within 24 hours.
            <br />
            <button type="button" onClick={onClose} style={{ marginTop: 16, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Close</button>
          </div>
        ) : (
          <div className="lead-form">
            <input type="text" className="lead-input" placeholder="Your name *" value={form.name} onChange={(e) => set('name', e.target.value)} />
            <input type="text" className="lead-input" placeholder="Phone number *" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            <input type="text" className="lead-input" placeholder="City / Area" value={form.city} onChange={(e) => set('city', e.target.value)} />
            <select className="lead-input" value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
              <option value="" disabled>Property type</option>
              <option>1BHK Apartment</option><option>2BHK Apartment</option><option>3BHK Apartment</option>
              <option>4BHK+ Apartment</option><option>Independent House / Villa</option>
              <option>Office / Commercial</option><option>Under construction</option>
            </select>
            <select className="lead-input" value={form.timeline} onChange={(e) => set('timeline', e.target.value)}>
              <option value="" disabled>When are you looking to automate?</option>
              <option>As soon as possible</option><option>Within a month</option>
              <option>1–3 months</option><option>Just exploring</option>
            </select>
            <textarea className="lead-input" rows={3} placeholder="Any specific problems or questions?" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            <div className="lead-modal-actions">
              <button type="button" className="lead-cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="lead-submit" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Sending…' : 'Book free visit'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
