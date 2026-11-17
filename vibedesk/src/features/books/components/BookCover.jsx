import { useState } from 'react';
import { AiOutlineBook } from 'react-icons/ai';

function CoverImage({ src, title, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`vd-book-cover bg-body-tertiary border rounded d-flex flex-column align-items-center justify-content-center gap-2 text-body-secondary ${className}`} role="img" aria-label={`Belum ada sampul untuk ${title || 'buku'}`}><AiOutlineBook size={40} /><small>Belum ada sampul</small></div>;
  }
  return <img src={src} alt={`Sampul ${title || 'buku'}`} className={`vd-book-cover rounded border ${className}`} onError={() => setFailed(true)} />;
}

export default function BookCover({ src, title, className = '' }) {
  return <CoverImage key={src || 'empty'} src={src} title={title} className={className} />;
}
