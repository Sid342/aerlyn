import { useState } from 'react';
import { site, whatsappUrl } from '../../config/site.js';
import { submitLead } from '../../lib/submitLead.js';
import { validateContact } from '../../lib/validate.js';
import Shell from '../../pages/Shell.jsx';
import Breadcrumb from '../../pages/Breadcrumb.jsx';
import '../../pages/pages.css';

// An order request: sent to the owner's Formspree form, no payment taken here.
// The customer is told we will call to confirm, which is what happens.
export default function OrderRequest() {
  const [slug, setSlug] = useState(
    () => new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('p') || site.products[0].slug
  );
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', address: '', _gotcha: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState(null); // null | 'sending' | 'failed' | { name, phone }
  const p = site.products.find((x) => x.slug === slug) || site.products[0];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    const { errors: errs, phone } = validateContact(form);
    if (!form.address.trim()) errs.address = 'Please enter your delivery address.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const name = form.name.trim();
    setState('sending');
    const { ok } = await submitLead('visit', {
      _subject: `Order request — ${name} (${phone}) — ${qty} × ${p.name}`,
      Name: name,
      Phone: phone,
      Product: p.name,
      Quantity: qty,
      Address: form.address.trim(),
      _gotcha: form._gotcha,
    });
    setState(ok ? { name, phone } : 'failed');
  }

  const sent = state && typeof state === 'object' ? state : null;
  const wa = state === 'failed' && whatsappUrl(`Hi Aerlyn, I'd like to order ${qty} × ${p.name}. I'm ${form.name.trim()}.`);

  return (
    <Shell>
      <div className="page-wrap">
        <Breadcrumb current="Order" />
        <h1>Order</h1>
        {sent ? (
          <>
            <p role="status">Thanks, {sent.name}. We have your request for {qty} × {p.name}. We'll call you on {sent.phone} to confirm.</p>
            <a className="btn" href={`/products/${p.slug}.html`}>Back to product</a>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="page-muted">Send your request and we'll call you to confirm the details and the price. No payment now.</p>
            <p><label>Product{' '}
              <select value={slug} onChange={(e) => setSlug(e.target.value)}>
                {site.products.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
              </select>
            </label></p>
            <p><label>Quantity{' '}
              <input type="number" min="1" max="20" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
            </label></p>
            <p><label>Name <input value={form.name} autoComplete="name" onChange={(e) => set('name', e.target.value)} /></label>
              {errors.name && <span role="alert"> {errors.name}</span>}</p>
            <p><label>Phone <input type="tel" inputMode="tel" value={form.phone} autoComplete="tel" onChange={(e) => set('phone', e.target.value)} /></label>
              {errors.phone && <span role="alert"> {errors.phone}</span>}</p>
            <p><label>Delivery address <textarea rows="3" value={form.address} autoComplete="street-address" onChange={(e) => set('address', e.target.value)} /></label>
              {errors.address && <span role="alert"> {errors.address}</span>}</p>
            <input type="text" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} value={form._gotcha} onChange={(e) => set('_gotcha', e.target.value)} />
            {state === 'failed' && (
              <p role="alert">We couldn't send that. Please try again{wa && <> or <a href={wa}>message us on WhatsApp</a></>}.</p>
            )}
            <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send order request'}</button>
          </form>
        )}
      </div>
    </Shell>
  );
}
