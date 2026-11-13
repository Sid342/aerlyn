import { site } from '../config/site.js';
import { BookButton } from '../features/marketing/Booking.jsx';
import { TEST_BUY, TEST_CHECKOUT_PATH } from '../routes.js';
import Shell from './Shell.jsx';
import Breadcrumb from './Breadcrumb.jsx';
import './pages.css';

export default function ProductPage({ route }) {
  const p = route.product;
  return (
    <Shell product={p.name}>
      <div className="page-wrap">
        <Breadcrumb current={p.name} />
        <div className="product-photo">
          <img src={p.image} width={p.imageWidth} height={p.imageHeight} alt={`${p.name} Wi-Fi switch module`} />
        </div>

        <h1>{p.name}</h1>
        <p className="page-muted">{p.tagline}</p>

        <div className="product-actions">
          {TEST_BUY && <a className="btn" href={`${TEST_CHECKOUT_PATH}?p=${p.slug}`}>Buy now (test)</a>}
          <BookButton />
          <a className="btn quiet" href="/#planner">Plan my home</a>
        </div>
        <p className="page-muted">We supply and fit {site.brand} products after a free home visit. The price is in your written quote.</p>

        <h2>Features</h2>
        <ul>
          {p.features.map((f) => <li key={f}>{f}</li>)}
        </ul>

        <h2>Specifications</h2>
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
