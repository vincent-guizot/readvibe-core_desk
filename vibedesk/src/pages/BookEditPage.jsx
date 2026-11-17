import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '../components/shared/PageHeader';
import { visualAssets } from '../constants/visual-assets';
import AsyncStatus from '../components/ui/AsyncStatus';
import BookForm from '../features/books/components/BookForm';
import { useBookDetail } from '../features/books/useBookDetail';
import { useBookSave } from '../features/books/useBookSave';

export default function BookEditPage({
  authors,
  categories,
  moods,
  onDeleteBook,
}) {
  const { id } = useParams();
  const detail = useBookDetail(id);
  const mutation = useBookSave(id);
  const removing = useSelector((state) => state.books.remove.loading);
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        breadcrumbItems={[
          { label: 'Books Catalog', path: '/books' },
          { label: detail.data?.title || 'Book Detail', path: `/books/${id}` },
          { label: 'Edit Book' },
        ]}
        illustration={visualAssets.bookStack}
        title="Edit Book"
        description="Perbarui informasi buku dalam katalog ReadVibe."
      />
      <AsyncStatus
        loading={detail.loading}
        error={detail.error}
        onRetry={detail.status === 404 ? null : detail.retry}
      />
      {!detail.loading && detail.error && (
        <Link to="/books" className="btn btn-outline-secondary">
          Kembali ke katalog
        </Link>
      )}
      {!detail.loading && !detail.error && detail.data && (
        <BookForm
          key={id}
          book={detail.data}
          authors={authors}
          categories={categories}
          moods={moods}
          saving={mutation.loading}
          error={mutation.error}
          onSave={mutation.save}
          onChange={mutation.clearError}
        />
      )}
      {detail.data && onDeleteBook && (
        <button
          className="btn btn-outline-danger mt-4"
          disabled={mutation.loading || removing}
          onClick={async () => {
            if (await onDeleteBook(id, detail.data.title)) navigate('/books');
          }}
        >
          Hapus Buku
        </button>
      )}
    </div>
  );
}
