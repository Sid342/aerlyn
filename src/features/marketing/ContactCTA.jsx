import { BookButton } from './Booking.jsx';
import './ContactCTA.css';

export default function ContactCTA() {
  return (
    <section id="contact" className="section">
      <div className="contact-box">
        <h2 className="section-title">Want us to take a look?</h2>
        <p>Book a free visit. We'll call you within a day to fix a time.</p>
        <BookButton />
      </div>
    </section>
  );
}
