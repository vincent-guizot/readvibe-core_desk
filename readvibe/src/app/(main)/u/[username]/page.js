'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import http from '@/services/http';
import { mapBook, mapReading, mapUser } from '@/services/reader.api';

export default function PublicProfilePage() {
  const { username } = useParams();
  return <PublicProfile key={username} username={username} />;
}

function PublicProfile({ username }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    (async () => {
      const profile = await http.get(`/api/auth/public/${encodeURIComponent(username)}`);
      const user = mapUser(profile.data.user);
      const [shelf, wishes] = await Promise.all([http.get(`/api/reading/user/${user.id}/finished`), http.get(`/api/wishlists/username/${encodeURIComponent(username)}`)]);
      if (active) setResult({ user, finished: shelf.data.finished.map(mapReading), wishlist: wishes.data.items.map((item) => ({ ...item, book: mapBook(item.book) })) });
    })().catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [username, version]);
  if (error) return <div role="alert" className="container py-5">{error} <button className="btn btn-outline-secondary" onClick={() => { setError(''); setResult(null); setVersion((value) => value + 1); }}>Retry</button></div>;
  if (!result) return <p role="status" className="container py-5">Loading public profile…</p>;
  const { user, finished, wishlist } = result;
  const reviews = finished.filter((record) => record.reviewContent);
  return <div className="container py-4 pb-5">
    <Link href="/discover">Discover</Link>
    <section className="card border-0 rounded-4 shadow-sm p-4 my-4">
      {user.avatar && <img src={user.avatar} alt={user.name} width="80" height="80" className="rounded-circle object-fit-cover mb-3" />}
      <h1>{user.name}</h1><p className="text-muted">@{user.username}</p>{user.bio && <p>{user.bio}</p>}{user.location && <p>{user.location}</p>}
      <p>{finished.length} finished reads · {reviews.length} public reviews · {wishlist.length} public wishlist books</p>
      <Link href={`/u/${encodeURIComponent(username)}/wishlist`}>View public wishlist</Link>
    </section>
    <h2 className="h4">Stories from this shelf</h2>
    {!finished.length && <p>No finished reads to show yet.</p>}
    <div className="row g-3">{finished.map((record) => <article className="col-md-6" key={record.id}><div className="card p-4 h-100"><h3 className="h5"><Link href={`/books/${record.bookId}`}>{record.book?.title}</Link></h3><p>{record.book?.author}</p>{record.rating && <p>{record.rating} out of 5</p>}{record.reviewContent && <><h4 className="h6">{record.reviewTitle || 'Reader reflection'}</h4>{record.containsSpoilers ? <details><summary>Contains spoilers</summary><p>{record.reviewContent}</p></details> : <p>{record.reviewContent}</p>}</>}</div></article>)}</div>
  </div>;
}
