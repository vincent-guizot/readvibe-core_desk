import PageHeader from '../components/shared/PageHeader';
import { visualAssets } from '../constants/visual-assets';
import BookForm from '../features/books/components/BookForm';
import { useBookSave } from '../features/books/useBookSave';

export default function BookCreatePage({ authors, categories, moods }) {
  const { save, loading, error, clearError } = useBookSave();
  return (
    <div>
      <PageHeader
        breadcrumbItems={[
          { label: 'Books Catalog', path: '/books' },
          { label: 'Add New Book' },
        ]}
        illustration={visualAssets.bookStack}
        title="Add New Book"
        description="Tambahkan buku baru ke dalam katalog ReadVibe."
      />
      <BookForm
        authors={authors}
        categories={categories}
        moods={moods}
        saving={loading}
        error={error}
        onSave={save}
        onChange={clearError}
      />
    </div>
  );
}
