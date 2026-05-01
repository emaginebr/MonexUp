import React from 'react';
import ReactDOM from 'react-dom/client';
// Tailwind + design tokens (home route surface). Imported FIRST so Bootstrap's
// component CSS, loaded via the SCSS theme below, can still win cascade ties
// for legacy pages that rely on Bootstrap utilities.
import './styles/globals.css';
import './monexup-theme.scss';
import './monexup-styles.scss';
import './editmode.css';
import 'react-loading-skeleton/dist/skeleton.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from './Components/ScrollToTop';
import './i18n'; // Import i18next configuration

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.REACT_APP_SITE_BASENAME}>
      <ScrollToTop />
      <React.Suspense fallback="loading...">
        <App />
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
