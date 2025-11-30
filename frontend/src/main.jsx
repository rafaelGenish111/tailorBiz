import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { RtlProvider } from './utils/RtlProvider';

// בדיקת נגישות - רצה רק בסביבת פיתוח
const initAxe = () => {
  if (import.meta.env.DEV) {
    import('@axe-core/react').then((axe) => {
      axe.default(React, ReactDOM, 1000);
    }).catch(console.error);
  }
};

initAxe();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <RtlProvider>
          <App />
        </RtlProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
