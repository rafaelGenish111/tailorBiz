import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import RtlProvider from './utils/RtlProvider';

// בדיקת נגישות - רצה רק בסביבת פיתוח
const initAxe = () => {
  if (import.meta.env.DEV) {
    import('@axe-core/react').then((axe) => {
      axe.default(React, ReactDOM, 1000);
    }).catch(console.error);
  }
};

initAxe();

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <HelmetProvider>
        <BrowserRouter>
          <RtlProvider>
            <App />
          </RtlProvider>
        </BrowserRouter>
      </HelmetProvider>
    </CacheProvider>
  </React.StrictMode>,
)
