import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/global.css'; // first, so component styles can override it
import App from './App.jsx';

const root = document.getElementById('root');
const app = (
  <React.StrictMode>
    <App path={window.location.pathname} />
  </React.StrictMode>
);

// Prerendered pages hydrate; `vite dev` serves an empty root and renders from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
