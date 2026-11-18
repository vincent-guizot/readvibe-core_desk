'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth, useReading, useWishlist, useBooks } from '@/hooks';
import EditProfileModal from '@/components/EditProfileModal';

export default function ProfilePage() {
  const { user } = useAuth();
  const { currentReading, finishedReads, status } = useReading();
  const { wishlist } = useWishlist();
  const { getBookById } = useBooks();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('shelf');
  if (!user) return <div className="container py-5"><Link href="/login">Sign in to view your profile</Link></div>;
  const records = tab === 'shelf' ? currentReading : finishedReads;
  return <div className="container py-4 pb-5">
    <Link href="/">Home</Link>
    <section className="card border-0 rounded-4 shadow-sm p-4 my-4">
      <div className="d-flex flex-wrap align-items-center gap-4">
        {user.avatar && <img src={user.avatar} alt={user.name} width="88" height="88" className="rounded-circle object-fit-cover" />}
        <div className="flex-grow-1"><h1 className="h2">{user.name}</h1><p className="text-muted">@{user.username}</p>{user.bio && <p>{user.bio}</p>}{user.location && <p>{user.location}</p>}</div>
        <button className="btn btn-rv-plum" onClick={() => setEditing(true)}>Edit profile</button>
        <Link href={`/u/${user.username}`} className="btn btn-outline-secondary">View public profile</Link>
      </div>
    </section>
    <div className="row g-3 mb-4">
      {[[currentReading.length, 'Currently reading', '/my-reading'], [finishedReads.length, 'Finished reads', '/finished-reads'], [wishlist.length, 'Wishlist books', '/wishlist']].map(([count, label, href]) => <div className="col-sm-4" key={href}><Link href={href} className="card p-4 text-decoration-none"><strong className="h2">{count}</strong>{label}</Link></div>)}
    </div>
    <div className="d-flex gap-2 mb-4" role="group" aria-label="Profile sections">
      <button className={`btn ${tab === 'shelf' ? 'btn-rv-plum' : 'btn-outline-secondary'}`} onClick={() => setTab('shelf')}>Currently on my shelf</button>
      <button className={`btn ${tab === 'finished' ? 'btn-rv-plum' : 'btn-outline-secondary'}`} onClick={() => setTab('finished')}>Finished reads & reviews</button>
    </div>
    {status === 'loading' && <p role="status">Loading reading activity…</p>}
    {!records.length && status !== 'loading' && <p>No books on this shelf yet.</p>}
    <div className="row g-3">{records.map((record) => {
      const book = getBookById(record.bookId) || record.book;
      if (!book) return null;
      return <article key={record.id} className="col-md-6"><div className="card p-4 h-100"><h2 className="h5"><Link href={`/books/${book.id}`}>{book.title}</Link></h2><p className="text-muted">{book.author}</p>{tab === 'shelf' ? <p>Page {record.currentPage} of {book.pages || 'unknown'}</p> : <><p>{record.rating ? `${record.rating} out of 5` : 'Not rated'}</p>{record.reviewContent && <p>{record.reviewContent}</p>}<Link href={`/finished-reads/edit-review?bookId=${book.id}`}>Edit review</Link><Link href={`/vibe-card?bookId=${book.id}`} className="mt-2">Create Vibe Card</Link></>}</div></article>;
    })}</div>
    <p className="small text-muted mt-4">Your progress and private notes are visible only to you.</p>
    <Link href="/stats">View reading stats</Link>
    {editing && <EditProfileModal isOpen onClose={() => setEditing(false)} />}
  </div>;
}
