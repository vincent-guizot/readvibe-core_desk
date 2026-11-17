import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineBook,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineFileText,
  AiOutlineTags,
} from 'react-icons/ai';
import PageHeader from '../components/shared/PageHeader';
import AsyncStatus from '../components/ui/AsyncStatus';
import Button from '../components/ui/Button';
import BookCover from '../features/books/components/BookCover';
import { useBookDetail } from '../features/books/useBookDetail';
import { clearBookFeedback, deleteBook } from '../features/books/booksSlice';
import { fetchResource } from '../features/workspace/workspaceSlice';

const displayDate = (value) =>
  value ? new Date(value).toLocaleString('id-ID') : '—';

export default function BookDetailPage({ canManage }) {
  const { id } = useParams();
  const detail = useBookDetail(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useSelector((state) => state.books.remove);
  const active = useRef(true);
  const [section, setSection] = useState('overview');
  useEffect(() => {
    active.current = true;
    dispatch(clearBookFeedback());
    return () => {
      active.current = false;
    };
  }, [dispatch, id]);
  const remove = async () => {
    if (
      mutation.loading ||
      !canManage ||
      !window.confirm(
        `Hapus buku "${detail.data.title}" dari katalog? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    const result = await dispatch(deleteBook(id));
    if (deleteBook.fulfilled.match(result)) {
      dispatch(fetchResource('books'));
      if (active.current)
        navigate('/books', {
          replace: true,
          state: { message: 'Buku berhasil dihapus.' },
        });
    }
  };
  const book = detail.data;
  const reviews = book?.reviews || [];
  return (
    <div>
      <PageHeader
        breadcrumbItems={[
          { label: 'Books Catalog', path: '/books' },
          { label: book?.title || 'Book Detail' },
        ]}
        illustration={null}
        title="Book Detail"
        description="Lihat informasi lengkap buku dan keterkaitannya."
        actions={
          <>
            <Link to="/books" className="btn btn-outline-secondary">
              <AiOutlineArrowLeft className="me-2" />
              Kembali
            </Link>
            {canManage && book && !detail.loading && !detail.error && (
              <>
                <Link
                  to={`/books/${id}/edit`}
                  className={`btn btn-outline-secondary ${mutation.loading ? 'disabled' : ''}`}
                >
                  <AiOutlineEdit className="me-2" />
                  Edit Book
                </Link>
                <Button
                  variant="outline-danger"
                  loading={mutation.loading}
                  onClick={remove}
                >
                  <AiOutlineDelete className="me-2" />
                  Hapus
                </Button>
              </>
            )}
          </>
        }
      />
      <AsyncStatus
        loading={detail.loading}
        error={detail.error}
        onRetry={detail.status === 404 ? null : detail.retry}
      />
      {mutation.error && (
        <div className="alert alert-danger" role="alert">
          {mutation.error}
        </div>
      )}
      {!detail.loading && !detail.error && book && (
        <>
          {location.state?.message && (
            <div className="alert alert-success" role="status">
              {location.state.message}
            </div>
          )}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <section className="card vd-card p-4 h-100">
                <div className="d-flex flex-column flex-sm-row gap-4">
                  <BookCover
                    src={book.image}
                    title={book.title}
                    className="flex-shrink-0"
                  />
                  <div>
                    <h2 className="vd-section-title fs-2 mb-2">{book.title}</h2>
                    {book.subtitle && (
                      <p className="text-body-secondary mb-2">
                        {book.subtitle}
                      </p>
                    )}
                    <p className="mb-3">
                      by{' '}
                      <strong>
                        {book.author?.name ||
                          book.author?.pen_name ||
                          'Penulis belum ditentukan'}
                      </strong>
                    </p>
                    <span
                      className={`vd-status ${Number(book.stock) > 0 ? 'vd-status--active' : 'vd-status--danger'}`}
                    >
                      {Number(book.stock) > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                    <div className="mt-3">
                      <span className="vd-pill">
                        {book.genre?.name || 'Tanpa kategori'}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {(book.moods || []).map((mood) => (
                        <span className="vd-pill" key={mood.id}>
                          {mood.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="col-lg-4">
              <section className="card vd-card p-4 h-100">
                <h2 className="vd-section-title mb-3">Catalog Summary</h2>
                <dl className="mb-0">
                  <dt className="small text-body-secondary">Stok internal</dt>
                  <dd className="fs-3 fw-bold">
                    {Number(book.stock || 0).toLocaleString('id-ID')}
                  </dd>
                  <dt className="small text-body-secondary">Harga referensi</dt>
                  <dd>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(Number(book.price || 0))}
                  </dd>
                  <dt className="small text-body-secondary">
                    Ulasan publik yang disetujui
                  </dt>
                  <dd className="mb-0">{reviews.length}</dd>
                </dl>
                <h3 className="h6 mt-4">Informasi editorial</h3>
                {book.editorialPicks?.length ? (
                  book.editorialPicks.map((pick) => (
                    <div key={pick.id} className="border-top py-2">
                      <strong>{pick.tagline}</strong>
                      <p className="small mb-1">
                        {pick.curatorNotes ||
                          pick.note ||
                          'Tanpa catatan kurator'}
                      </p>
                      <span className="small text-secondary">
                        Bobot {pick.curationWeight}% ·{' '}
                        {pick.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <Link
                        className="d-block small"
                        to={`/editorial-picks/${pick.id}/edit`}
                      >
                        Edit kurasi
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="small text-secondary">
                    Belum menjadi pilihan editorial.
                  </p>
                )}
                {book.authorId && (
                  <Link className="small" to={`/authors/${book.authorId}`}>
                    Lihat profil penulis dan buku terkait
                  </Link>
                )}
              </section>
            </div>
          </div>
          <div
            className="nav nav-pills bg-white border rounded p-2 gap-2 mb-4"
            role="tablist"
            aria-label="Detail buku"
          >
            {[
              ['overview', 'Overview'],
              ['content', 'Content'],
              ['reviews', 'Reviews'],
            ].map(([key, label]) => (
              <button
                key={key}
                id={`book-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={section === key}
                aria-controls={`book-panel-${key}`}
                tabIndex={section === key ? 0 : -1}
                onKeyDown={(event) => {
                  const keys = ['overview', 'content', 'reviews'];
                  const index = keys.indexOf(key);
                  const next =
                    event.key === 'ArrowRight'
                      ? keys[(index + 1) % keys.length]
                      : event.key === 'ArrowLeft'
                        ? keys[(index + keys.length - 1) % keys.length]
                        : event.key === 'Home'
                          ? keys[0]
                          : event.key === 'End'
                            ? keys.at(-1)
                            : null;
                  if (next) {
                    event.preventDefault();
                    setSection(next);
                    document.getElementById(`book-tab-${next}`)?.focus();
                  }
                }}
                className={`nav-link ${section === key ? 'active' : 'text-body'}`}
                onClick={() => setSection(key)}
              >
                {label}
                {key === 'reviews' ? ` (${reviews.length})` : ''}
              </button>
            ))}
          </div>
          <div
            id={`book-panel-${section}`}
            role="tabpanel"
            aria-labelledby={`book-tab-${section}`}
            tabIndex={0}
          >
            {section === 'reviews' ? (
              <section className="card vd-card p-4">
                <h2 className="vd-section-title mb-3">Public Reviews</h2>
                {!reviews.length ? (
                  <p className="text-body-secondary mb-0">
                    Belum ada ulasan publik yang disetujui.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <article key={review.id} className="border-bottom py-3">
                      <strong>
                        {review.user?.profile?.fullname ||
                          review.user?.username ||
                          'Pembaca'}
                      </strong>
                      <p className="vd-preserve-lines mt-2 mb-0">
                        {review.publicReview}
                      </p>
                    </article>
                  ))
                )}
              </section>
            ) : (
              <div className="row g-4">
                <div className="col-lg-8">
                  <section className="card vd-card p-4 mb-4">
                    <h2 className="vd-section-title mb-3">
                      <AiOutlineFileText className="me-2" />
                      Book Synopsis
                    </h2>
                    <p className="vd-preserve-lines mb-0">
                      {book.description || 'Belum ada sinopsis.'}
                    </p>
                  </section>
                  {section === 'overview' && (
                    <section className="card vd-card p-4">
                      <h2 className="vd-section-title mb-3">
                        <AiOutlineBook className="me-2" />
                        Book Information
                      </h2>
                      <dl className="row mb-0">
                        {Object.entries({
                          ISBN: book.isbn,
                          Publisher: book.publisher,
                          Edition: book.edition,
                          Language: book.language,
                          Format: book.format,
                          'Dimensions (cm)':
                            book.widthCm || book.heightCm
                              ? `${book.widthCm ?? '—'} × ${book.heightCm ?? '—'}`
                              : null,
                          'Publication Year': book.year,
                          'Page Count': book.page,
                          'Catalog ID': book.id,
                          'Created At': displayDate(book.createdAt),
                          'Updated At': displayDate(book.updatedAt),
                        }).map(([label, value]) => (
                          <div
                            key={label}
                            className="col-md-6 border-bottom py-2"
                          >
                            <dt className="small text-body-secondary">
                              {label}
                            </dt>
                            <dd className="mb-0">{value ?? '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}
                </div>
                <div className="col-lg-4">
                  <section className="card vd-card p-4">
                    <h2 className="vd-section-title mb-3">
                      <AiOutlineTags className="me-2" />
                      Classification
                    </h2>
                    <h3 className="h6">Category / Genre</h3>
                    <p>{book.genre?.name || 'Belum ditentukan'}</p>
                    <h3 className="h6">Mood Tags</h3>
                    <div className="d-flex flex-wrap gap-2">
                      {(book.moods || []).map((mood) => (
                        <span key={mood.id} className="vd-pill">
                          {mood.name}
                        </span>
                      ))}
                      {!book.moods?.length && (
                        <span className="small text-body-secondary">
                          Belum ada mood tag.
                        </span>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
