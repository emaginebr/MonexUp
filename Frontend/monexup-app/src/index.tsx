import React from 'react';
import ReactDOM from 'react-dom/client';
//import './bootstrap-bwhale.css';
import './bootstrap.css';
import 'react-loading-skeleton/dist/skeleton.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import env from 'react-dotenv';
import ScrollToTop from './Components/ScrollToTop';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={env.SITE_BASENAME}>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
