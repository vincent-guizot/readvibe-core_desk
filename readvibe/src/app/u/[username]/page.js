'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AiFillStar } from 'react-icons/ai';

export default function PublicProfilePage() {
  const { username } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3360';

  const [finished, setFinished] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch user by username or id
    fetch(`${API_URL}/api/members?search=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then(async (res) => {
        const found = res.data?.members?.find((m) => m.username.toLowerCase() === username.toLowerCase());
        if (found) {
          setUser(found);
          // Fetch public finished reads
          const finRes = await fetch(`${API_URL}/api/reading/user/${found.id}/finished`);
          const finData = await finRes.json();
          if (finData.data?.finished) {
            setFinished(finData.data.finished);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username, API_URL]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Profile Banner */}
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4 text-center mx-auto" style={{ maxWidth: '720px' }}>
        <img
          src={user?.profile?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
          alt=""
          className="rounded-circle mx-auto mb-3 shadow-sm"
          style={{ width: '84px', height: '84px' }}
        />
        <h3 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          {user?.profile?.fullname || username}
        </h3>
        <p className="text-muted small mb-3">@{username} &bull; Pembaca di ReadVibe</p>

        <div className="d-flex justify-content-center gap-3">
          <Link href={`/u/${username}/wishlist`} className="btn btn-sm btn-outline-secondary rounded-pill px-4">
            Lihat Wishlist Publik
          </Link>
        </div>
      </div>

      {/* Finished Reads */}
      <div className="mx-auto" style={{ maxWidth: '800px' }}>
        <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
          📚 Buku yang Telah Selesai Dibaca ({finished.length})
        </h5>

        {finished.length === 0 ? (
          <div className="p-4 bg-white rounded-4 border text-center text-muted small">
            Belum ada catatan buku yang selesai dibagikan ke publik.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {finished.map((item) => (
              <div key={item.id} className="p-3 bg-white rounded-3 border d-flex gap-3 align-items-center">
                <img
                  src={item.book?.image || 'https://via.placeholder.com/60x90'}
                  alt=""
                  className="rounded"
                  style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold mb-0">{item.book?.title}</h6>
                    <div className="text-warning">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <AiFillStar key={i} size={14} />
                      ))}
                    </div>
                  </div>
                  <small className="text-muted d-block mb-1">{item.book?.author?.name || 'Penulis'}</small>
                  {item.quote && <p className="small fst-italic text-muted mb-0">"{item.quote}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
