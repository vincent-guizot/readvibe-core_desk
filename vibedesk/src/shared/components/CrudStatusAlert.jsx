export default function CrudStatusAlert({ status }) {
  if (!status?.message) return null;

  const variant = status.type === 'error' ? 'danger' : 'success';
  return (
    <div className={`alert alert-${variant} py-2 small`} role="status">
      {status.message}
    </div>
  );
}
