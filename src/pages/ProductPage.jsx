import { useState } from 'react';
import { site } from '../config/site.js';
import LeadModal from '../features/marketing/LeadModal.jsx';
import Shell from './Shell.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import './pages.css';

export default function ProductPage({ route }) {
  const p = route.product;
  const [booking, setBooking] = useState(false);

  return (
    <Shell>
      <div className="page-wrap">
        <Breadcrumb current={p.name} />
        <div className="product-photo">
          <img src={p.image} width={p.imageWidth} height={p.imageHeight} alt={`${p.name} smart Wi-Fi retrofit switch module`} />
        </div>

        <h1>{p.name}</h1>
        <p className="page-muted">{p.tagline}</p>

        <div className="product-actions">
          <button type="button" className="btn-cta" onClick={() => setBooking(true)}>Book an appointment</button>
          <a className="btn-cta secondary" href="/#planner">Plan your home</a>
        </div>
        <p className="page-muted">{site.brand} products are supplied and installed through a home visit. Pricing is shared in your free quote.</p>

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
      {booking && <LeadModal product={p.name} onClose={() => setBooking(false)} />}
    </Shell>
  );
}
