import { visualAssets } from '../../constants/visual-assets';

export default function EmptyState({ title, description, illustration = visualAssets.emptyData, actions, compact = false }) {
  return (
    <div className={`vd-empty-state text-center ${compact ? 'vd-empty-state--compact py-3' : 'py-4'}`}>
      {illustration && <img src={illustration} alt="" className="vd-empty-state__image mb-3" loading="lazy" decoding="async" />}
      <h3 className="h6 fw-semibold mb-2">{title}</h3>
      {description && <p className="small text-body-secondary mb-3">{description}</p>}
      {actions && <div className="d-flex flex-wrap justify-content-center gap-2">{actions}</div>}
    </div>
  );
}
