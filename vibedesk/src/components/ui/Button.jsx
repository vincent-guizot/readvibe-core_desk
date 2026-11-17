export default function Button({ variant = 'vd-primary', className = '', type = 'button', loading = false, disabled = false, children, ...props }) {
  return <button {...props} type={type} className={`btn btn-${variant} ${className}`} disabled={disabled || loading}>
    {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
    {children}
  </button>;
}
