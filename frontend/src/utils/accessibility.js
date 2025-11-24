export const accessibilityOptions = {
  fontSize: {
    small: 14,
    normal: 16,
    large: 18,
    extraLarge: 20,
  },
  contrast: {
    normal: 'normal',
    high: 'high',
    inverted: 'inverted',
  },
};

export const applyAccessibility = (settings) => {
  const root = document.documentElement;
  
  // גודל טקסט
  root.style.fontSize = `${settings.fontSize}px`;
  
  // ניגודיות
  if (settings.contrast === 'high') {
    root.style.filter = 'contrast(1.5)';
  } else if (settings.contrast === 'inverted') {
    root.style.filter = 'invert(1) hue-rotate(180deg)';
  } else {
    root.style.filter = 'none';
  }
  
  // קישורים מודגשים
  if (settings.highlightLinks) {
    root.style.setProperty('--link-decoration', 'underline');
  } else {
    root.style.setProperty('--link-decoration', 'none');
  }
  
  // cursor גדול
  if (settings.largeCursor) {
    root.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\'%3E%3Cpath d=\'M10,10 L10,35 L20,28 L26,38 L30,36 L24,26 L35,26 Z\' fill=\'black\'/%3E%3C/svg%3E") 12 12, auto';
  } else {
    root.style.cursor = 'auto';
  }
  
  // שמירה ב-localStorage
  localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
};

export const getAccessibilitySettings = () => {
  const saved = localStorage.getItem('accessibilitySettings');
  return saved ? JSON.parse(saved) : {
    fontSize: 16,
    contrast: 'normal',
    highlightLinks: false,
    largeCursor: false,
  };
};
