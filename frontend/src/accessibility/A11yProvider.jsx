import React, { createContext, useContext, useState, useEffect } from 'react';

const A11yContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
};

export const A11yProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Apply accessibility settings to document
    if (largeText) {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '';
    }

    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (reducedMotion) {
      document.documentElement.style.setProperty('--prefers-reduced-motion', 'reduce');
    } else {
      document.documentElement.style.removeProperty('--prefers-reduced-motion');
    }
  }, [highContrast, largeText, reducedMotion]);

  const value = {
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    reducedMotion,
    setReducedMotion,
  };

  return (
    <A11yContext.Provider value={value}>
      {children}
    </A11yContext.Provider>
  );
};

export default A11yProvider;

