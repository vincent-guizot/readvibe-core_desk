'use client';

import React from 'react';

export const Input = React.forwardRef(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-100">
        {label && (
          <label htmlFor={inputId} className="form-label fw-semibold small text-muted mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rv-input ${error ? 'border-danger' : ''} ${className}`.trim()}
          {...props}
        />
        {error && <div className="text-danger small mt-1">{error}</div>}
        {helperText && !error && <div className="text-muted small mt-1">{helperText}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
