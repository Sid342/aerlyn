import SiteNav from '../features/marketing/SiteNav.jsx';
import SiteFooter from '../features/marketing/SiteFooter.jsx';
import { BookingProvider } from '../features/marketing/Booking.jsx';
import StickyAction from '../features/savePlan/StickyAction.jsx';

// Shared page frame. The sticky bar comes after the footer as a direct child of the page root;
// it needs that to keep sticking. `product` is the product name on a product page.
export default function Shell({ children, product }) {
  return (
    <BookingProvider product={product}>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <StickyAction />
    </BookingProvider>
  );
}
