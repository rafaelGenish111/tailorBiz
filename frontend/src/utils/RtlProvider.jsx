import React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

// יצירת cache עם תמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

export const RtlProvider = ({ children }) => {
  return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
};


