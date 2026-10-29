export default function Loading() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-50 p-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Memuat halaman...</span>
      </div>
    </div>
  );
}
