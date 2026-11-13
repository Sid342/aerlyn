import { matchRoute } from './routes.js';
import { HomeProvider } from './context/HomeContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PlateDesignerPage from './pages/PlateDesignerPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import PolicyPage from './pages/PolicyPage.jsx';
import TestCheckout from './features/testBuy/TestCheckout.jsx';

const PAGES = {
  landing: LandingPage,
  plate: PlateDesignerPage,
  product: ProductPage,
  privacy: PrivacyPage,
  policy: PolicyPage,
  testCheckout: TestCheckout,
};

// `path` is location.pathname on the client and the route path in the prerender.
// Every page gets the plan: the header and the bar at the bottom of the screen depend on it.
export default function App({ path }) {
  const route = matchRoute(path);
  const Page = PAGES[route.page];
  return (
    <HomeProvider>
      <Page route={route} />
    </HomeProvider>
  );
}
