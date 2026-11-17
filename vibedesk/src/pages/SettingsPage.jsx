import PageHeader from '../components/shared/PageHeader';
import AsyncStatus from '../components/ui/AsyncStatus';
import SettingsForm from '../features/settings/SettingsForm';
import { useApiQuery } from '../hooks/useApiQuery';
import { API_URL } from '../constants/api';
export default function SettingsPage() {
  const query = useApiQuery('/api/settings');
  const health = useApiQuery('/api/settings/health');
  return (
    <>
      <PageHeader
        title="System Settings"
        description="Status layanan aktual dan konfigurasi aplikasi yang aman."
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      <section className="card vd-card p-4 mb-4">
        <div className="d-flex justify-content-between gap-3 mb-3">
          <h2 className="h5">Koneksi layanan</h2>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={health.loading}
            onClick={health.retry}
          >
            Periksa ulang
          </button>
        </div>
        <p className="small text-break">VibeCore: {API_URL}</p>
        <AsyncStatus
          loading={health.loading}
          error={health.error}
          onRetry={health.retry}
        />
        {health.data && (
          <>
            <dl>
              {[
                ['api', 'API'],
                ['database', 'Database'],
                ['googleBooks', 'Google Books'],
              ].map(([key, label]) => (
                <div
                  className="d-flex justify-content-between border-bottom py-2"
                  key={key}
                >
                  <dt>{label}</dt>
                  <dd className="mb-0">{health.data[key]}</dd>
                </div>
              ))}
            </dl>
            <p className="small text-secondary">
              Diperiksa:{' '}
              {new Date(health.data.checkedAt).toLocaleString('id-ID')}. Google
              Books{' '}
              {health.data.googleBooksKeyConfigured
                ? 'memiliki konfigurasi key di server'
                : 'menggunakan akses publik tanpa key'}
              ; keterjangkauan tidak menjamin sisa kuota.
            </p>
          </>
        )}
      </section>
      {query.data && <SettingsForm initial={query.data} />}
    </>
  );
}
