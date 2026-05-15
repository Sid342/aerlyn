import { useState } from 'react';
import LeadModal from './LeadModal.jsx';
import './ContactCTA.css';

export default function ContactCTA() {
  const [phone, setPhone] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <section id="contact" className="contact-section">
        <div className="contact-box">
          <div className="contact-eyebrow">The first step is free</div>
          <h2 className="contact-title">Your intelligent home<br />starts with <em>one visit.</em></h2>
          <p className="contact-body-text">Book a free home consultation. Our expert comes to you, reviews your requirements, and designs a solution that fits your home, your lifestyle, and your budget. Completely free. Zero obligation.</p>
          <div className="contact-form">
            <input type="text" className="contact-input" placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type="button" className="contact-submit" onClick={() => setModalOpen(true)}>Book free visit</button>
          </div>
        </div>
        <footer className="site-footer">© {new Date().getFullYear()} Aerlyn. All rights reserved.</footer>
      </section>
      {modalOpen && <LeadModal phone={phone} onClose={() => setModalOpen(false)} />}
    </>
  );
}
