import { useEffect, useRef, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import BookCover from './BookCover';
import { COVER_ACCEPT, validateCoverFile } from '../cover-file';

export default function BookCoverUpload({ file, image, title, disabled, error, onSelect, onError }) {
  const [preview, setPreview] = useState('');
  const input = useRef(null);
  const objectUrl = useRef(null);
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);
  const clear = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setPreview('');
    if (input.current) input.current.value = '';
    onSelect(null);
    onError(null);
  };
  const select = (files) => {
    if (disabled) return;
    const nextFile = files?.[0];
    if (!nextFile) return;
    const message = files.length > 1 ? 'Pilih satu file cover saja.' : validateCoverFile(nextFile);
    if (message) {
      onError(message);
      return;
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(nextFile);
    setPreview(objectUrl.current);
    onSelect(nextFile);
    onError(null);
  };
  return <>
    <BookCover src={preview || image} title={title} className="mx-auto mb-3" />
    <div className="vd-cover-dropzone rounded p-3 text-center mb-2" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
      event.preventDefault();
      select(event.dataTransfer.files);
    }}>
      <input ref={input} id="book-cover-file" type="file" accept={COVER_ACCEPT} disabled={disabled} className="visually-hidden" aria-label="Pilih file cover" aria-invalid={Boolean(error)} aria-describedby={error ? 'book-cover-error book-cover-help' : 'book-cover-help'} onChange={(event) => select(event.target.files)} />
      <label htmlFor="book-cover-file" className="d-flex flex-column align-items-center gap-2">
        <AiOutlineCloudUpload size={32} aria-hidden="true" />
        <strong>Drag & drop gambar di sini</strong>
        <span className="small text-body-secondary">atau klik untuk memilih file</span>
      </label>
    </div>
    <p id="book-cover-help" className="small text-body-secondary mb-2">JPG, PNG, WEBP · Maks. 5 MB · Rasio disarankan 2:3.</p>
    {file && <p className="small text-break mb-2">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
    {error && <p id="book-cover-error" className="small text-danger" role="alert">{error}</p>}
    {(file || error) && <button type="button" className="btn btn-outline-secondary btn-sm mb-3" disabled={disabled} onClick={clear}>Batalkan pilihan file</button>}
  </>;
}
