import { useState } from 'react';
import { site } from '../../config/site.js';
import Shell from '../../pages/Shell.jsx';
import Breadcrumb from '../../pages/Breadcrumb.jsx';
import '../../pages/pages.css';

// TEST ONLY. Present only when built with VITE_TEST_BUY=1 (see routes.js). Sends nothing,
// stores nothing, takes no payment. Never ship with the flag set.
export default function TestCheckout() {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(null);
  const [slug, setSlug] = useState(
    () => new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('p') || site.products[0].slug
  );
  const p = site.products.find((x) => x.slug === slug) || site.products[0];

  const submit = (e) => {
    e.preventDefault();
    setDone({ id: `TEST-${Date.now().toString(36).toUpperCase()}`, name: new FormData(e.target).get('name') });
  };

  return (
    <Shell>
      <div className="page-wrap">
        <Breadcrumb current="Test checkout" />
        <p role="alert" style={{ border: '2px dashed #f5a623', padding: 12 }}>
          <strong>TEST FLOW.</strong> No order is placed, no payment is taken, nothing is sent or saved.
        </p>
        <h1>Checkout (test)</h1>
        {done ? (
          <>
            <h2>Test order placed</h2>
            <p>Thanks {done.name}. Dummy order id <strong>{done.id}</strong>: {qty} × {p.name}. Nothing was sent.</p>
            <a className="btn" href={`/products/${p.slug}.html`}>Back to product</a>
          </>
        ) : (
          <form onSubmit={submit}>
            <p>
              <label>Product{' '}
                <select value={slug} onChange={(e) => setSlug(e.target.value)}>
                  {site.products.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
                </select>
              </label>
            </p>
            <p>
              <label>Quantity{' '}
                <input type="number" min="1" max="10" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
              </label>
            </p>
            <p><label>Name <input name="name" required /></label></p>
            <p><label>Phone <input name="phone" type="tel" required pattern="[0-9+ ]{10,14}" /></label></p>
            <p><label>Address <textarea name="address" required rows="3" /></label></p>
            <p className="page-muted">Payment: dummy. Price: none.</p>
            <button className="btn" type="submit">Place test order</button>
          </form>
        )}
      </div>
    </Shell>
  );
}
