'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBooks, useReading, useAuth } from '@/hooks';
import UpdateProgressModal from '@/components/UpdateProgressModal';
import FinishBookModal from '@/components/FinishBookModal';

export default function ReaderPage() {
  const params = useParams();
  const { getBookById, status: catalogStatus } = useBooks();
  const { getBookProgress, isBookFinished, status, startBook } = useReading();
  const { isAuthenticated } = useAuth();
  const [editingProgress, setEditingProgress] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const book = getBookById(params?.id);
  const progress = book && getBookProgress(book.id);
  const finished = book && isBookFinished(book.id);

  if (!book && ['idle', 'loading'].includes(catalogStatus)) return <p role="status" className="p-4">Loading book…</p>;
  if (!book) return <div className="container py-5"><h1>Book not found</h1><Link href="/discover">Discover books</Link></div>;
  let previewUrl = '';
  try {
    const url = new URL(book.previewLink);
    if (['https:', 'http:'].includes(url.protocol)) previewUrl = url.href;
  } catch { /* A book without a provider preview remains a reading tracker. */ }

  return <div className="container py-5" style={{ maxWidth: '800px' }}>
    <Link href="/my-reading">← My Reading</Link>
    <h1 className="mt-4">{book.title}</h1>
    <p className="text-muted">{book.author}</p>
    <h2 className="h5">Book preview</h2>
    {previewUrl ? <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open publisher preview</a> : <p>A digital preview is not available for this book. Track your reading from your own copy below.</p>}
    {book.synopsis && <p className="mt-3">{book.synopsis}</p>}
    <section className="card p-4 mt-4" aria-label="Reading activity">
      <h2 className="h5">Your reading progress</h2>
      {!isAuthenticated ? <Link href="/login">Sign in to save your reading progress.</Link> : <>
        {progress ? <p>Page {progress.currentPage} of {book.pages || 'unknown'}</p> : <p>{finished ? 'You have finished this book.' : 'You have not started this book yet.'}</p>}
        {progress?.notes && <p><strong>Private notes:</strong> {progress.notes}</p>}
        <div className="d-flex flex-wrap gap-2">
          {progress ? <>
            <button className="btn btn-rv-plum" onClick={() => setEditingProgress(true)}>Update progress</button>
            <button className="btn btn-outline-secondary" onClick={() => setFinishing(true)}>Finish book</button>
          </> : !finished ? <button className="btn btn-rv-plum" disabled={status === 'loading'} onClick={() => startBook(book.id)}>Start reading</button> : <Link href="/finished-reads">View finished reads</Link>}
        </div>
      </>}
    </section>
    <Link className="d-inline-block mt-4" href={`/books/${book.id}`}>Back to book details</Link>
    {editingProgress && <UpdateProgressModal book={book} currentReading={progress} isOpen onClose={() => setEditingProgress(false)} />}
    {finishing && <FinishBookModal book={book} isOpen onClose={() => setFinishing(false)} />}
  </div>;
}
