import { useEffect, useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { submitLead } from '../../lib/submitLead.js';
import { validateContact } from '../../lib/validate.js';
import { planLink, planLeadFields, visitLeadFields } from '../../lib/planShare.js';
import { whatsappUrl } from '../../config/site.js';
import { PRIVACY_PATH } from '../../routes.js';
import { useDialog } from '../../lib/useDialog.js';
import ShareOptions from '../savePlan/ShareOptions.jsx';
import './LeadModal.css';

// The appointment form. With a plan it sends the whole plan; from a product page it sends the product name.
export default function LeadModal({ product, onClose }) {
  const { home, plan } = useHome();
  const withPlan = !product && !!home.homeType;
  const [form, setForm] = useState({ name: '', phone: '', city: '', notes: '', _gotcha: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'failed' | the contact that was sent
  const dialog = useDialog(true, onClose);
  const sent = status && status !== 'failed' ? status : null;

  // The form is replaced by the confirmation; keep focus inside the dialog.
  useEffect(() => {
    if (sent) dialog.current.focus();
  }, [sent]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  const link = () => planLink(window.location.origin, plan);

  async function handleSubmit(e) {
    e.preventDefault();
    const { errors: errs, phone } = validateContact(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const contact = { name: form.name.trim(), phone, city: form.city.trim(), notes: form.notes.trim(), _gotcha: form._gotcha };
    setSubmitting(true);
    const { ok } = withPlan
      ? await submitLead('plan', planLeadFields(plan, contact, link()))
      : await submitLead('visit', visitLeadFields(contact, product));
    setSubmitting(false);
    setStatus(ok ? contact : 'failed');
  }

  const failed = status === 'failed';
  const waUrl = failed && whatsappUrl(`Hi Aerlyn, I'm ${form.name.trim()} and I'd like to book an appointment.${withPlan ? ` My plan: ${link()}` : ''}`);

  return (
    <div className="lead-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" ref={dialog} tabIndex={-1}>
        <h2 id="lead-modal-title">Book an appointment</h2>
        {sent ? (
          <div className="lead-form">
            <p className="lead-ok" role="status">Thanks, {sent.name}. We'll call you on {sent.phone} within a day to fix a time.</p>
            {withPlan && (
              <>
                <p className="lead-modal-sub">We have your {home.homeType} plan. Keep a copy if you like.</p>
                <ShareOptions />
              </>
            )}
            <div className="lead-modal-actions">
              <button type="button" className="btn" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <form className="lead-form" onSubmit={handleSubmit} noValidate>
            <p className="lead-modal-sub">
              {withPlan ? `We'll call you to fix a time. Your ${home.homeType} plan is sent with this.` : "We'll call you to fix a time. The visit is free."}
            </p>
            <label className="lead-field">
              Name
              <input type="text" className="lead-input" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'lead-name-error' : undefined} value={form.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            {errors.name && <div id="lead-name-error" className="field-error" role="alert">{errors.name}</div>}
            <label className="lead-field">
              Phone
              <input type="tel" inputMode="tel" className="lead-input" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'lead-phone-error' : undefined} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </label>
            {errors.phone && <div id="lead-phone-error" className="field-error" role="alert">{errors.phone}</div>}
            <label className="lead-field">
              <span>City <span className="lead-optional">(optional)</span></span>
              <input type="text" className="lead-input" autoComplete="address-level2" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </label>
            <label className="lead-field">
              <span>Anything we should know? <span className="lead-optional">(optional)</span></span>
              <textarea className="lead-input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </label>
            <input className="hp-field" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form._gotcha} onChange={(e) => set('_gotcha', e.target.value)} />
            {failed && (
              <div className="field-error" role="alert">
                We couldn't send your request. Your details are still here, so please try again.
                {waUrl && <> Or <a href={waUrl} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.</>}
              </div>
            )}
            <p className="lead-consent">
              We use these details to contact you about your visit. <a href={PRIVACY_PATH} target="_blank" rel="noopener noreferrer">Privacy policy</a>
            </p>
            <div className="lead-modal-actions">
              <button type="button" className="btn quiet" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Sending…' : failed ? 'Try again' : 'Book an appointment'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
