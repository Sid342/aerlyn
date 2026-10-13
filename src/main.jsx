import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/global.css'; // first, so component styles can override it
import App from './App.jsx';
import { matchRoute } from './routes.js';

const root = document.getElementById('root');
const app = (
  <React.StrictMode>
    <App path={window.location.pathname} />
  </React.StrictMode>
);

// A prerendered page hydrates. Anything else renders from scratch: `vite dev` serves an empty
// root, and a host can answer an address it does not know with the home page's HTML.
if (root.dataset.path === matchRoute(window.location.pathname).path) hydrateRoot(root, app);
else createRoot(root).render(app);
