'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary', // 'primary' | 'coral' | 'outline' | 'ghost' | 'soft'
      size = 'md', // 'sm' | 'md' | 'lg'
      className = '',
      type = 'button',
      disabled = false,
      onClick,
      animate = true,
      ...props
    },
    ref
  ) => {
    const variantClass = {
      primary: 'rv-btn-primary',
      coral: 'rv-btn-coral',
      outline: 'rv-btn-outline',
      ghost: 'rv-btn-ghost',
      soft: 'rv-btn-soft',
    }[variant] || 'rv-btn-primary';

    const sizeClass = {
      sm: 'rv-btn-sm',
      md: '',
      lg: 'rv-btn-lg',
    }[size] || '';

    const combinedClass = `rv-btn ${variantClass} ${sizeClass} ${className}`.trim();

    if (animate && !disabled) {
      return (
        <motion.button
          ref={ref}
          type={type}
          className={combinedClass}
          disabled={disabled}
          onClick={onClick}
          whileHover={{ scale: 1.015, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.97 }}
          {...props}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClass}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
