import SiteNav from '../features/marketing/SiteNav.jsx';
import SiteFooter from '../features/marketing/SiteFooter.jsx';
import CartDrawer from '../features/cart/CartDrawer.jsx';

// Shared page frame. `after` renders after the footer as a direct child of the page root —
// the sticky plan bar needs that to keep sticking.
export default function Shell({ children, after }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      {after}
      <CartDrawer />
    </>
  );
}
