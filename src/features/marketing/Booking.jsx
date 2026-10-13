import { createContext, useContext, useState } from 'react';
import LeadModal from './LeadModal.jsx';

const BookingContext = createContext(null);

// One appointment form per page. `product` is the product name on a product page.
export function BookingProvider({ product, children }) {
  const [open, setOpen] = useState(false);
  return (
    <BookingContext.Provider value={setOpen}>
      {children}
      {open && <LeadModal product={product} onClose={() => setOpen(false)} />}
    </BookingContext.Provider>
  );
}

export function BookButton({ className = 'btn' }) {
  const setOpen = useContext(BookingContext);
  return <button type="button" className={className} onClick={() => setOpen(true)}>Book an appointment</button>;
}
