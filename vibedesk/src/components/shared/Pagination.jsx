export default function Pagination({ page, totalPages, onChange, disabled }) {
  const pages = Math.max(1, totalPages || 1);
  return (
    <nav
      aria-label="Pagination"
      className="d-flex justify-content-between align-items-center gap-3 pt-3"
    >
      <span className="small text-secondary">
        Halaman {page} dari {pages}
      </span>
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Sebelumnya
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={disabled || page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}
