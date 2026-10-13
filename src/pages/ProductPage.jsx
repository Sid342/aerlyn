import { useState } from 'react';
import { site } from '../config/site.js';
import { useCart } from '../features/cart/CartContext.jsx';
import { inr } from '../lib/cart.js';
import Shell from './Shell.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import './pages.css';

export default function ProductPage({ route }) {
  const p = route.product;
  const { add, openCart } = useCart();
  const [qty, setQty] = useState('1');

  function addToCart() {
    add(p.id, qty);
    openCart();
  }

  return (
    <Shell>
      <div className="page-wrap">
        <Breadcrumb current={p.name} />
        <div className="product-photo">
          <span className="product-badge">Best Seller</span>
          <img src={p.image} width={p.imageWidth} height={p.imageHeight} alt={`${p.name} smart Wi-Fi retrofit switch module`} />
        </div>

        <h1>{p.name}</h1>
        <p className="page-muted">{p.tagline}</p>

        <p className="product-price">
          {inr(p.price)} {p.mrp > p.price && <s>{inr(p.mrp)}</s>}
        </p>

        <div className="product-buy">
          <label className="product-qty">Qty
            <input type="number" min="1" max="99" value={qty} onChange={(e) => setQty(e.target.value)} />
          </label>
          <button type="button" className="btn-cta" onClick={addToCart}>Add to Cart</button>
          {site.email && (
            <a className="btn-cta secondary" href={`mailto:${site.email}?subject=${encodeURIComponent(`Order ${p.name}`)}`}>Contact to order</a>
          )}
        </div>
        <p className="page-muted">In stock · ships in 2–3 days</p>

        <div className="product-trust"><span>1-Year Warranty</span><span>Easy Returns</span><span>Fast Shipping</span></div>

        <h2>Key Features</h2>
        <ul>
          {p.features.map((f) => <li key={f}>{f}</li>)}
        </ul>

        <h2>Technical Specifications</h2>
        <table>
          <tbody>
            {p.specs.map(([label, value]) => (
              <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
