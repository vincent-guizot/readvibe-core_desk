import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';
import { Link, useLocation } from 'react-router-dom';
import { pageHeaderAssets, visualAssets } from '../../constants/visual-assets';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

export default function PageHeader({ eyebrow, title, description, actions, children, breadcrumbItems, illustration }) {
  const breadcrumbs = useBreadcrumbs();
  const { pathname } = useLocation();
  const headerArt = illustration === undefined ? pageHeaderAssets[pathname] || visualAssets.leafBranch : illustration;
  return (
    <header className={`vd-page-header mb-4 ${headerArt ? '' : 'vd-page-header--plain'}`}>
      <div className="vd-page-header__content">
        <nav className="vd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="text-reset" aria-label="Control Center"><AiOutlineHome aria-hidden="true" /></Link>
          {breadcrumbItems ? breadcrumbItems.map((item, index) => <React.Fragment key={item.path || index}><span>/</span>{item.path ? <Link className="text-reset text-decoration-none" to={item.path}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</React.Fragment>) : <><span>/</span><span>{eyebrow || breadcrumbs.at(-1)?.label}</span></>}
        </nav>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
      {headerArt && <div className="vd-page-header__art" aria-hidden="true">
        <img src={headerArt} alt="" decoding="async" />
      </div>}
      {actions && <div className="vd-page-header__actions">{actions}</div>}
    </header>
  );
}
