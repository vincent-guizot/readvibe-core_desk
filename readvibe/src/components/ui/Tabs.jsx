'use client';

import React from 'react';

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <div className={`rv-tabs-root ${className}`.trim()}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, activeValue, onValueChange, className = '' }) {
  return (
    <div className={`rv-tab-list ${className}`.trim()} role="tablist">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isActive: child.props.value === activeValue,
            onClick: () => onValueChange && onValueChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, isActive, onClick, className = '', count }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`rv-tab-trigger ${isActive ? 'active' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`badge rounded-pill ${
            isActive ? 'bg-primary text-white' : 'bg-light text-muted'
          }`}
          style={{ fontSize: '0.75rem' }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, className = '' }) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={`pt-3 animate-fade-in ${className}`.trim()}>
      {children}
    </div>
  );
}

export default Tabs;
