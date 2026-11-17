import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineArrowLeft, AiOutlineBook, AiOutlineFileText, AiOutlinePicture, AiOutlineSave, AiOutlineTags } from 'react-icons/ai';
import Button from '../../../components/ui/Button';
import BookCoverUpload from './BookCoverUpload';
import { getBookForm, toBookPayload, validateBookForm } from '../book-form';
import { BOOK_TEXT_METADATA, BOOK_FORMAT_SUGGESTIONS, BOOK_LANGUAGE_SUGGESTIONS, BOOK_DIMENSIONS } from '../book.constants';

export default function BookForm({ book, authors, categories, moods, saving, error, onSave, onChange }) {
  const [form, setForm] = useState(() => getBookForm(book));
  const [errors, setErrors] = useState({});
  const [coverFile, setCoverFile] = useState(null);
  const [coverError, setCoverError] = useState(null);
  const formRef = useRef(null);
  const cancelTo = book ? `/books/${book.id}` : '/books';
  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    onChange?.();
  };
  const fieldProps = (name) => ({
    id: `book-${name}`,
    name,
    value: form[name],
    onChange: (event) => updateField(name, event.target.value),
    className: `form-control ${errors[name] ? 'is-invalid' : ''}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `book-${name}-error` : undefined,
  });
  const feedback = (name) => errors[name] && <div id={`book-${name}-error`} className="invalid-feedback">{errors[name]}</div>;
  const metadataInput = (name) => {
    const { label, maxLength } = BOOK_TEXT_METADATA[name];
    return <>
      <label className="form-label fw-semibold" htmlFor={`book-${name}`}>{label}</label>
      <input {...fieldProps(name)} maxLength={maxLength} placeholder={`${label} (opsional)`} list={['format', 'language'].includes(name) ? `book-${name}-options` : undefined} />
      {feedback(name)}
    </>;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (coverError) {
      document.getElementById('book-cover-file')?.focus();
      return;
    }
    const nextErrors = validateBookForm(coverFile ? { ...form, image: '' } : form);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      formRef.current?.elements.namedItem(firstError)?.focus();
      return;
    }
    await onSave(toBookPayload(form), coverFile);
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <fieldset disabled={saving} className="border-0 p-0 m-0">
        <legend className="visually-hidden">Form buku</legend>
        <div className="row g-4">
          <div className="col-xl-8">
            <nav className="nav nav-pills bg-white border rounded p-2 gap-2 mb-4" aria-label="Bagian form buku">
              <a href="#book-information" className="nav-link active"><AiOutlineBook className="me-2" />Book Details</a>
              <a href="#book-synopsis" className="nav-link text-body"><AiOutlineFileText className="me-2" />Content & Description</a>
              <a href="#book-classification" className="nav-link text-body"><AiOutlineTags className="me-2" />Classification</a>
            </nav>
            <section id="book-information" className="card vd-card p-4 mb-4">
              <h2 className="vd-section-title mb-1"><AiOutlineBook className="me-2" />Book Information</h2>
              <p className="small text-body-secondary mb-4">Informasi dasar buku dalam katalog ReadVibe.</p>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" htmlFor="book-title">Title <span className="text-danger">*</span></label>
                  <input {...fieldProps('title')} required placeholder="Masukkan judul buku" />
                  {feedback('title')}
                </div>
                <div className="col-md-6">{metadataInput('subtitle')}</div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="book-isbn">ISBN</label>
                  <input {...fieldProps('isbn')} placeholder="ISBN buku" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="book-authorId">Author <span className="text-danger">*</span></label>
                  <select {...fieldProps('authorId')} className={`form-select ${errors.authorId ? 'is-invalid' : ''}`} required>
                    <option value="">Pilih penulis...</option>
                    {authors.map((author) => <option key={author.id} value={author.id}>{author.name || author.pen_name}</option>)}
                  </select>
                  {feedback('authorId')}
                  {!authors.length && <p className="form-text mb-0">Belum ada penulis. <Link to="/authors">Tambahkan penulis</Link> terlebih dahulu.</p>}
                </div>
                <div className="col-md-6">{metadataInput('publisher')}</div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" htmlFor="book-year">Publication Year</label>
                  <input {...fieldProps('year')} type="number" min="0" step="1" placeholder="Tahun terbit" />
                  {feedback('year')}
                </div>
                <div className="col-md-4">{metadataInput('edition')}</div>
                <div className="col-md-4">{metadataInput('language')}</div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" htmlFor="book-page">Page Count</label>
                  <input {...fieldProps('page')} type="number" min="0" step="1" placeholder="Jumlah halaman" />
                  {feedback('page')}
                </div>
                <div className="col-md-4">{metadataInput('format')}</div>
                <fieldset className="col-md-4">
                  <legend className="form-label fw-semibold fs-6">Dimensions (cm)</legend>
                  <div className="row g-2">
                    {Object.entries(BOOK_DIMENSIONS).map(([name, label]) => (
                      <div className="col-6" key={name}>
                        <label className="visually-hidden" htmlFor={`book-${name}`}>{label}</label>
                        <input {...fieldProps(name)} type="number" min="0.01" max="999999.99" step="0.01" placeholder={name === 'widthCm' ? '13.50' : '20.00'} />
                        {feedback(name)}
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <datalist id="book-format-options">{BOOK_FORMAT_SUGGESTIONS.map((format) => <option key={format} value={format} />)}</datalist>
              <datalist id="book-language-options">{BOOK_LANGUAGE_SUGGESTIONS.map((language) => <option key={language} value={language} />)}</datalist>
            </section>
            <section id="book-synopsis" className="card vd-card p-4 mb-4">
              <h2 className="vd-section-title mb-1"><AiOutlineFileText className="me-2" />Book Synopsis</h2>
              <p className="small text-body-secondary">Tulis sinopsis untuk membantu pembaca mengenal buku ini.</p>
              <label className="visually-hidden" htmlFor="book-description">Sinopsis buku</label>
              <textarea {...fieldProps('description')} rows={9} placeholder="Tulis sinopsis atau deskripsi buku di sini..." />
              <small className="text-body-secondary text-end mt-2">{form.description.length.toLocaleString('id-ID')} karakter</small>
            </section>
          </div>
          <div className="col-xl-4">
            <section className="card vd-card p-4 mb-4">
              <h2 className="vd-section-title mb-1"><AiOutlinePicture className="me-2" />Book Cover</h2>
              <p className="small text-body-secondary">Pratinjau sampul buku.</p>
              <BookCoverUpload file={coverFile} image={!validateBookForm(form).image ? form.image.trim() : ''} title={form.title} disabled={saving} error={coverError} onSelect={(file) => {
                setCoverFile(file);
                setErrors((current) => ({ ...current, image: undefined }));
                onChange?.();
              }} onError={setCoverError} />
              <label className="form-label small fw-semibold" htmlFor="book-image">URL gambar sampul</label>
              <input {...fieldProps('image')} type="url" placeholder="https://..." disabled={saving || Boolean(coverFile)} />
              {feedback('image')}
            </section>
            <section id="book-classification" className="card vd-card p-4 mb-4">
              <h2 className="vd-section-title mb-1"><AiOutlineTags className="me-2" />Classification</h2>
              <p className="small text-body-secondary">Kelompokkan buku agar mudah ditemukan.</p>
              <label className="form-label fw-semibold" htmlFor="book-genreId">Category / Genre <span className="text-danger">*</span></label>
              <select {...fieldProps('genreId')} className={`form-select ${errors.genreId ? 'is-invalid' : ''}`} required>
                <option value="">Pilih kategori...</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {feedback('genreId')}
              {!categories.length && <p className="form-text mb-0">Belum ada kategori. <Link to="/categories">Tambahkan kategori</Link> terlebih dahulu.</p>}
              <span className="form-label fw-semibold mt-3" id="book-moods-label">Mood Tags</span>
              <div className="d-flex flex-wrap gap-2" role="group" aria-labelledby="book-moods-label">
                {moods.map((mood) => <button key={mood.id} type="button" className={`btn btn-sm rounded-pill ${form.moodIds.includes(mood.id) ? 'btn-vd-primary' : 'btn-outline-secondary'}`} aria-pressed={form.moodIds.includes(mood.id)} onClick={() => updateField('moodIds', form.moodIds.includes(mood.id) ? form.moodIds.filter((id) => id !== mood.id) : [...form.moodIds, mood.id])}>{mood.name}</button>)}
                {!moods.length && <small className="text-body-secondary">Belum ada mood tag.</small>}
              </div>
            </section>
            <section className="card vd-card p-4 mb-4">
              <h2 className="vd-section-title mb-3">Inventory & Price</h2>
              <label className="form-label fw-semibold" htmlFor="book-stock">Stock <span className="text-danger">*</span></label>
              <input {...fieldProps('stock')} type="number" min="0" step="1" required />
              {feedback('stock')}
              <label className="form-label fw-semibold mt-3" htmlFor="book-price">Reference Price (Rp) <span className="text-danger">*</span></label>
              <input {...fieldProps('price')} type="number" min="0" step="1" required />
              {feedback('price')}
              <p className="small text-body-secondary mt-3 mb-0">Ketersediaan stok ditentukan otomatis dari jumlah stok.</p>
            </section>
          </div>
        </div>
      </fieldset>
      <footer className="vd-book-form-footer bg-body border rounded p-3 d-flex flex-wrap justify-content-between gap-3">
        <Link to={cancelTo} className={`btn btn-outline-secondary ${saving ? 'disabled' : ''}`} aria-disabled={saving} tabIndex={saving ? -1 : undefined}><AiOutlineArrowLeft className="me-2" />Batal</Link>
        <Button type="submit" loading={saving}><AiOutlineSave className="me-2" />{saving ? 'Menyimpan...' : book ? 'Simpan Perubahan' : 'Simpan Buku'}</Button>
      </footer>
    </form>
  );
}
