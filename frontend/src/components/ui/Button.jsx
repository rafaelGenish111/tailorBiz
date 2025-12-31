import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * Premium Button Component - Apple Aesthetic
 * 
 * Ensures strict design uniformity across the entire application.
 * All buttons must use this component for consistency.
 * 
 * @param {string} variant - 'primary' | 'secondary'
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {string} to - React Router path (if provided, renders as Link)
 * @param {string} href - External URL (if provided, renders as anchor)
 * @param {ReactNode} children - Button content
 * @param {object} sx - Additional MUI sx styles (use sparingly)
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  to,
  href,
  children,
  startIcon,
  endIcon,
  onClick,
  disabled,
  type = 'button',
  sx = {},
  ...props
}) => {
  // Base styles - ALWAYS applied
  const baseStyles = {
    borderRadius: '9999px', // rounded-full (pill shape)
    fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
    fontWeight: 500, // font-medium
    textTransform: 'none',
    transition: 'all 0.3s ease', // transition-all duration-300
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  };

  // Size-based padding
  const sizeStyles = {
    small: {
      padding: '8px 20px',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '12px 32px', // px-8 py-3 equivalent - "High Ticket" look
      fontSize: '1rem',
    },
    large: {
      padding: '16px 40px',
      fontSize: '1.125rem',
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: '#0071E3', // bg-[#0071E3]
      color: '#ffffff', // text-white
      '&:hover': {
        backgroundColor: '#0077ED', // hover:bg-[#0077ED]
        boxShadow: '0px 8px 24px rgba(0, 113, 227, 0.3)', // hover:shadow-lg
        transform: 'scale(1.05)', // hover:scale-105
      },
      '&:disabled': {
        backgroundColor: '#86868B',
        color: '#ffffff',
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#1D1D1F', // text-[#1D1D1F]
      border: '1px solid #D1D1D6', // border border-gray-300
      '&:hover': {
        borderColor: '#1D1D1F', // hover:border-gray-800
        backgroundColor: 'rgba(29, 29, 31, 0.05)',
        transform: 'scale(1.05)',
      },
      '&:disabled': {
        borderColor: '#D1D1D6',
        color: '#86868B',
      },
    },
  };

  // Combine all styles
  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...sx,
  };

  // Determine component type
  let Component = MuiButton;
  const componentProps = {
    ...props,
    variant: variant === 'secondary' ? 'outlined' : 'contained', // Use outlined for secondary
    sx: combinedStyles,
    startIcon,
    endIcon,
    onClick,
    disabled,
    type,
  };

  if (to) {
    Component = MuiButton;
    componentProps.component = Link;
    componentProps.to = to;
  } else if (href) {
    Component = MuiButton;
    componentProps.component = 'a';
    componentProps.href = href;
  }

  return (
    <Component {...componentProps}>
      {children}
    </Component>
  );
};

export default Button;

