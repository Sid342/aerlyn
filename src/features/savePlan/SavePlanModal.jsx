import { useEffect, useRef, useState } from 'react';
import { useHome } from '../../context/HomeContext.jsx';
import { submitLead } from '../../lib/submitLead.js';
import { validateContact } from '../../lib/validate.js';
import { downloadPdf } from '../../lib/exportPdf.js';
import { planLink, whatsappShareUrl, planLeadFields, visitLeadFields } from '../../lib/planShare.js';
import { whatsappUrl } from '../../config/site.js';
import { useDialog } from '../../lib/useDialog.js';
import { useDownload, PDF_FAILED } from '../../lib/useDownload.js';
import '../marketing/LeadModal.css';
import './SavePlanModal.css';

export default function SavePlanModal({ onClose }) {
  const { home } = useHome();
  const [form, setForm] = useState({ name: '', phone: '', city: '', _gotcha: '' });
  const [errors, setErrors] = useState({});
  const [contact, setContact] = useState(null); // validated details, kept for retry and the visit lead
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'ok' | 'failed'
  const [copied, setCopied] = useState(null); // null | 'copied' | 'selected'
  const [visit, setVisit] = useState(null); // null | 'sending' | 'ok' | 'failed'
  const linkInput = useRef(null);
  const dialog = useDialog(true, onClose);
  const [download, pdfFailed] = useDownload(downloadPdf);

  // The form and the saved view replace each other; keep focus inside the dialog.
  useEffect(() => {
    if (status) dialog.current.focus();
  }, [status]);

  const link = planLink(window.location.origin, home);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function send(details) {
    setSubmitting(true);
    const { ok } = await submitLead('plan', planLeadFields(home, details, link));
    setSubmitting(false);
    setStatus(ok ? 'ok' : 'failed');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { errors: errs, phone } = validateContact(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const details = { name: form.name.trim(), phone, city: form.city.trim(), _gotcha: form._gotcha };
    setContact(details);
    send(details);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied('copied');
    } catch {
      // no clipboard access — select the link so it can be copied by hand
      linkInput.current.select();
      setCopied('selected');
    }
  }

  async function bookVisit() {
    setVisit('sending');
    const { ok } = await submitLead('visit', visitLeadFields(contact, link));
    setVisit(ok ? 'ok' : 'failed');
  }

  const failed = status === 'failed';
  const waPlan = failed && whatsappUrl(`Hi Aerlyn, I'm ${contact.name} and I'd like a quote for my ${home.homeType} plan: ${link}`);
  const waVisit = visit === 'failed' && whatsappUrl(`Hi Aerlyn, I'm ${contact.name} and I'd like to book a free home visit.`);

  return (
    <div className="lead-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="save-plan-title" ref={dialog} tabIndex={-1}>
        <h3 id="save-plan-title">Save my plan &amp; get a free quote</h3>
        {status === null ? (
          <form className="lead-form" onSubmit={handleSubmit} noValidate>
            <p className="lead-modal-sub">Get a link that reopens this plan on any device, and a free quote from Aerlyn. No obligation.</p>
            <input type="text" className="lead-input" placeholder="Your name *" aria-label="Your name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'save-name-error' : undefined} value={form.name} onChange={(e) => set('name', e.target.value)} />
            {errors.name && <div id="save-name-error" className="field-error" role="alert">{errors.name}</div>}
            <input type="tel" inputMode="tel" className="lead-input" placeholder="Phone number *" aria-label="Phone number" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'save-phone-error' : undefined} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            {errors.phone && <div id="save-phone-error" className="field-error" role="alert">{errors.phone}</div>}
            <input type="text" className="lead-input" placeholder="City (optional)" aria-label="City" autoComplete="address-level2" value={form.city} onChange={(e) => set('city', e.target.value)} />
            <input className="hp-field" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form._gotcha} onChange={(e) => set('_gotcha', e.target.value)} />
            <p className="save-consent">
              By saving, you agree that Aerlyn may contact you about this plan. See our <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">privacy policy</a>.
            </p>
            <div className="lead-modal-actions">
              <button type="button" className="lead-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="lead-submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save my plan'}</button>
            </div>
          </form>
        ) : (
          <div className="lead-form">
            {failed ? (
              <div className="field-error" role="alert">
                We couldn't send your plan to Aerlyn. Your plan is not lost — the link and PDF below still work.
                {waPlan && <> You can also <a href={waPlan} target="_blank" rel="noopener noreferrer">send it to us on WhatsApp</a>.</>}
                <div className="save-retry">
                  <button type="button" className="lead-submit" onClick={() => send(contact)} disabled={submitting}>{submitting ? 'Sending…' : 'Try again'}</button>
                  <button type="button" className="lead-cancel" onClick={() => setStatus(null)} disabled={submitting}>Edit my details</button>
                </div>
              </div>
            ) : (
              <p className="save-ok" role="status">✓ Plan saved and sent to Aerlyn. We'll call you on {contact.phone} about your quote.</p>
            )}

            <label className="save-label" htmlFor="save-plan-link">Your plan link — open it on any device to get this plan back</label>
            <div className="save-link-row">
              <input id="save-plan-link" ref={linkInput} className="lead-input" readOnly value={link} onFocus={(e) => e.target.select()} />
              <button type="button" className="save-btn" onClick={copyLink}>{copied === 'copied' ? 'Copied ✓' : 'Copy link'}</button>
            </div>
            <div className="save-hint" role="status">
              {copied === 'selected' && 'The link is selected — copy it with Ctrl+C / ⌘C, or press and hold on a phone.'}
            </div>

            <a className="save-btn" href={whatsappShareUrl(link)} target="_blank" rel="noopener noreferrer">Send to my WhatsApp</a>
            <button type="button" className="save-btn" onClick={() => download(home)}>Download PDF</button>
            {pdfFailed && <div className="field-error" role="alert">{PDF_FAILED}</div>}

            {status === 'ok' && (visit === 'ok' ? (
              <p className="save-ok" role="status">✓ Home visit requested. We'll call you to schedule.</p>
            ) : (
              <>
                <button type="button" className="save-btn" onClick={bookVisit} disabled={visit === 'sending'}>
                  {visit === 'sending' ? 'Sending…' : visit === 'failed' ? 'Try again — book an appointment' : 'Book an appointment'}
                </button>
                {visit === 'failed' && (
                  <div className="field-error" role="alert">
                    We couldn't send your visit request. Please try again.
                    {waVisit && <> Or <a href={waVisit} target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.</>}
                  </div>
                )}
              </>
            ))}

            <div className="lead-modal-actions">
              <button type="button" className="lead-cancel" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
