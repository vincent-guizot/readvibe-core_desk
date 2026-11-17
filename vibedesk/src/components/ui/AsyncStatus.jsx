import Button from './Button';

export default function AsyncStatus({ loading, error, onRetry }) {
  if (error) return <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert"><span>{error}</span>{onRetry && <Button variant="outline-danger" className="btn-sm" onClick={onRetry}>Coba lagi</Button>}</div>;
  if (loading) return <div className="small text-muted mb-3" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Memuat data...</div>;
  return null;
}
