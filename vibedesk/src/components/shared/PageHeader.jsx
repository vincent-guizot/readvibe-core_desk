import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

export default function PageHeader({ eyebrow, title, description, actions, children }) {
  const breadcrumbs = useBreadcrumbs();
  return (
    <header className="vd-page-header mb-4">
      <div className="vd-page-header__content">
        <nav className="vd-breadcrumb" aria-label="Breadcrumb"><AiOutlineHome aria-hidden="true" /> <span>/</span> <span>{eyebrow || breadcrumbs.at(-1)?.label}</span></nav>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
      <div className="vd-page-header__art" aria-hidden="true">
        <img src="/assets/illustrations/books.png" alt="" />
      </div>
      {actions && <div className="vd-page-header__actions">{actions}</div>}
    </header>
  );
}
