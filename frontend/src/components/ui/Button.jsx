import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * Premium Button Component - Dark Tech Aesthetic
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
    borderRadius: '9999px',
    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
    fontWeight: 500,
    textTransform: 'none',
    transition: 'all 0.3s ease',
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
      padding: '12px 32px',
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
      backgroundColor: '#00E676',
      color: '#111111',
      '&:hover': {
        backgroundColor: '#00FF99',
        boxShadow: '0px 8px 24px rgba(0, 230, 118, 0.3)',
        transform: 'scale(1.05)',
      },
      '&:disabled': {
        backgroundColor: '#424242',
        color: '#9E9E9E',
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '1px solid #424242',
      '&:hover': {
        borderColor: '#00E676',
        backgroundColor: 'rgba(0, 230, 118, 0.08)',
        transform: 'scale(1.05)',
      },
      '&:disabled': {
        borderColor: '#333333',
        color: '#616161',
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
    variant: variant === 'secondary' ? 'outlined' : 'contained',
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
