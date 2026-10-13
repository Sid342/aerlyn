import { useRef, useState } from 'react';
import { site, whatsappUrl } from '../config/site.js';
import { useCart } from '../features/cart/CartContext.jsx';
import { cartLines, cartTotal, inr, orderId, orderItemsText } from '../lib/cart.js';
import { submitLead } from '../lib/submitLead.js';
import { validateOrder } from '../lib/validate.js';
import { productPath } from '../routes.js';
import Shell from './Shell.jsx';
import './pages.css';

const EMPTY = { name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', _gotcha: '' };

function Field({ id, label, error, as: Tag = 'input', ...input }) {
  return (
    <div className="checkout-field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} name={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...input} />
      {error && <div id={`${id}-error`} className="field-error" role="alert">{error}</div>}
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, loaded, clear } = useCart();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [placed, setPlaced] = useState(null); // { name, id } once the order is sent
  const id = useRef(null); // made at first submit, kept across retries so a resend is recognisable

  const lines = cartLines(cart);
  const total = cartTotal(lines);
  const bind = (field) => ({
    value: form[field],
    error: errors[field],
    onChange: (e) => setForm((f) => ({ ...f, [field]: e.target.value })),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const { errors: errs, phone } = validateOrder(form);
    setErrors(errs);
    if (Object.keys(errs).length || !lines.length) return;

    id.current ||= orderId();
    const name = form.name.trim();
    setSubmitting(true);
    setFailed(false);
    const { ok } = await submitLead('order', {
      order_id: id.current,
      name,
      phone,
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      order_items: orderItemsText(lines),
      order_total: inr(total),
      _subject: `${site.brand} order ${id.current} — ${inr(total)}`,
      _gotcha: form._gotcha,
    });
    setSubmitting(false);
    if (!ok) {
      setFailed(true);
      return;
    }
    setPlaced({ name, id: id.current });
    clear();
    window.scrollTo(0, 0);
  }

  let body;
  if (placed) {
    body = (
      <div className="checkout-success">
        <div className="checkout-tick" aria-hidden="true">✓</div>
        <h1>Order placed!</h1>
        <p className="page-muted" role="status">Thank you, {placed.name}. Your order <span className="checkout-order-id">{placed.id}</span> has been received.</p>
        <p className="page-muted">We've emailed your details to our team and will contact you shortly to confirm delivery and payment.</p>
        <a className="btn-cta" href="/">Back to home</a>
      </div>
    );
  } else if (loaded && !lines.length) {
    body = (
      <div className="checkout-empty">
        <h1>Your cart is empty</h1>
        <p className="page-muted">Add a product before checking out.</p>
        <a className="btn-cta" href={productPath(site.products[0])}>Browse products</a>
      </div>
    );
  } else {
    const waUrl = failed && whatsappUrl(`Hi ${site.brand}, I'd like to place order ${id.current}:\n${orderItemsText(lines)}\nTotal ${inr(total)}`);
    body = (
      <>
        <h1>Checkout</h1>
        <p className="page-muted">Enter your delivery details to place the order. We'll contact you to confirm.</p>
        {loaded && (
          <div className="checkout-grid">
            <form onSubmit={handleSubmit} noValidate>
              <h2>Delivery details</h2>
              <Field id="name" label="Full name" type="text" autoComplete="name" {...bind('name')} />
              <div className="checkout-row">
                <Field id="phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" {...bind('phone')} />
                <Field id="email" label="Email" type="email" autoComplete="email" {...bind('email')} />
              </div>
              <Field id="address" label="Address (house no, street, area)" as="textarea" rows={2} autoComplete="street-address" {...bind('address')} />
              <div className="checkout-row">
                <Field id="city" label="City" type="text" autoComplete="address-level2" {...bind('city')} />
                <Field id="state" label="State" type="text" autoComplete="address-level1" {...bind('state')} />
              </div>
              <Field id="pincode" label="Pincode" type="text" inputMode="numeric" autoComplete="postal-code" {...bind('pincode')} />
              <input className="hp-field" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form._gotcha} onChange={(e) => setForm((f) => ({ ...f, _gotcha: e.target.value }))} />
              <button type="submit" className="btn-cta" disabled={submitting}>
                {submitting ? 'Placing order…' : failed ? 'Try again' : 'Place order'}
              </button>
              {failed && (
                <div className="field-error checkout-failed" role="alert">
                  We couldn't place your order — nothing was lost, your cart and details are still here. Please try again.
                  {waUrl && <> Or <a href={waUrl} target="_blank" rel="noopener noreferrer">send the order to us on WhatsApp</a>.</>}
                </div>
              )}
            </form>

            <div>
              <h2>Order summary</h2>
              <div className="checkout-summary">
                {lines.map((l) => (
                  <div key={l.id} className="checkout-item">
                    <div>{l.name}<br /><small>Qty {l.qty} · {inr(l.price)}</small></div>
                    <div>{inr(l.lineTotal)}</div>
                  </div>
                ))}
                <div className="checkout-total">Total<span>{inr(total)}</span></div>
              </div>
              <p className="page-muted checkout-note">Payment on confirmation. We'll call/email to arrange delivery &amp; payment.</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Shell>
      <div className="page-wrap">{body}</div>
    </Shell>
  );
}
