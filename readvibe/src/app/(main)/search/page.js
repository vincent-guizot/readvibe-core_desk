'use client';

import { Suspense } from 'react';
import BookCatalog from '@/components/books/BookCatalog';

export default function SearchPage() {
  return <Suspense fallback={<p role="status" className="container py-5">Loading catalog…</p>}><BookCatalog /></Suspense>;
}
