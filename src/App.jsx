import { matchRoute } from './routes.js';
import { CartProvider } from './features/cart/CartContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';

const PAGES = {
  landing: LandingPage,
  product: ProductPage,
  checkout: CheckoutPage,
  privacy: PrivacyPage,
};

// `path` is location.pathname on the client and the route path in the prerender.
export default function App({ path }) {
  const route = matchRoute(path);
  const Page = PAGES[route.page];
  return (
    <CartProvider>
      <Page route={route} />
    </CartProvider>
  );
}
