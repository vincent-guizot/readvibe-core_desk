import PageHeader from '../components/shared/PageHeader';
import AsyncStatus from '../components/ui/AsyncStatus';
import SettingsForm from '../features/settings/SettingsForm';
import { useApiQuery } from '../hooks/useApiQuery';
export default function RecommendationSettingsPage() {
  const query = useApiQuery('/api/settings');
  return (
    <>
      <PageHeader
        title="Recommendation Settings"
        description="Atur bobot dan lihat dampaknya pada urutan kandidat."
      />
      <AsyncStatus
        loading={query.loading}
        error={query.error}
        onRetry={query.retry}
      />
      {query.data && <SettingsForm recommendation initial={query.data} />}
    </>
  );
}
