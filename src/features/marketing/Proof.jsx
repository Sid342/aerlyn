import { site } from '../../config/site.js';
import './Proof.css';

// The numbers come from config. Photos, service area, brands and the customer quote render
// only once the owner has filled them in; nothing here is made up.
export default function Proof() {
  const { heroStats, photos, serviceArea, brands, testimonial } = site;
  return (
    <section id="proof" className="section">
      <h2 className="section-title">Aerlyn so far</h2>
      <dl className="proof-stats">
        {heroStats.map(({ number, label }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{number}</dd>
          </div>
        ))}
      </dl>
      {photos.length > 0 && (
        <div className="proof-photos">
          {photos.map((p) => <img key={p.src} src={p.src} width={p.width} height={p.height} alt={p.alt} loading="lazy" />)}
        </div>
      )}
      {(serviceArea || brands.length > 0) && (
        <p className="proof-facts">
          {serviceArea && <span>We work in {serviceArea}.</span>}
          {brands.length > 0 && <span>We fit {brands.join(', ')}.</span>}
        </p>
      )}
      {testimonial && (
        <figure className="proof-quote">
          <blockquote>{testimonial.quote}</blockquote>
          <figcaption>{[testimonial.name, testimonial.place].filter(Boolean).join(', ')}</figcaption>
        </figure>
      )}
    </section>
  );
}
