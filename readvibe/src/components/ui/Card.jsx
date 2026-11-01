'use client';

import React from 'react';

export function Card({ className = '', children, hoverable = false, ...props }) {
  return (
    <div
      className={`rv-card ${hoverable ? 'rv-card-interactive' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-3 pb-2 border-bottom ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, as = 'h3', ...props }) {
  const Component = as;
  return (
    <Component className={`m-0 fw-bold rv-editorial ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`small text-muted mb-0 mt-1 ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-3 pt-2 border-top bg-light-subtle rounded-bottom ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export default Card;
