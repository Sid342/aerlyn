import { matchRoute } from './routes.js';
import LandingPage from './pages/LandingPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import PolicyPage from './pages/PolicyPage.jsx';

const PAGES = {
  landing: LandingPage,
  product: ProductPage,
  privacy: PrivacyPage,
  policy: PolicyPage,
};

// `path` is location.pathname on the client and the route path in the prerender.
export default function App({ path }) {
  const route = matchRoute(path);
  const Page = PAGES[route.page];
  return <Page route={route} />;
}
