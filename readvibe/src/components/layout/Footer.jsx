'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-5 border-top bg-white mt-auto">
      <div className="container">
        <div className="row g-4 align-items-center justify-content-between mb-4">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img
                src="/assets/logos/readvibe-icon-plum.png"
                alt="ReadVibe"
                style={{ height: '28px', width: '28px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="fw-bold fs-5" style={{ fontFamily: 'var(--font-editorial)', color: 'var(--rv-ink-plum)' }}>
                ReadVibe
              </span>
            </div>
            <p className="text-muted small mb-0" style={{ maxWidth: '380px', lineHeight: 1.6 }}>
              Find your next read. Feel your next vibe. Curated by emotional resonance, powered by thoughtful AI.
            </p>
          </div>

          <div className="col-md-6">
            <div className="d-flex flex-wrap gap-4 justify-content-md-end small fw-semibold">
              <Link href="/discover" className="text-secondary text-decoration-none">
                Discover
              </Link>
              <Link href="/vibe-matcher" className="text-secondary text-decoration-none">
                AI Vibe Matcher
              </Link>
              <Link href="/my-reading" className="text-secondary text-decoration-none">
                My Reading
              </Link>
              <Link href="/wishlist" className="text-secondary text-decoration-none">
                Wishlist
              </Link>
              <Link href="/stats" className="text-secondary text-decoration-none">
                Stats & Recap
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-muted small">
          <span>&copy; {new Date().getFullYear()} ReadVibe. All rights reserved.</span>
          <span style={{ fontSize: '12px' }}>
            Powered by Google Gemini &bull; Emotional Reading Platform
          </span>
        </div>
      </div>
    </footer>
  );
}
