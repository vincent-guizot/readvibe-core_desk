import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBook } from './booksSlice';

export function useBookDetail(id) {
  const dispatch = useDispatch();
  const detail = useSelector((state) => state.books.detail);
  const validId = /^[1-9]\d*$/.test(String(id));
  useEffect(() => {
    if (!validId) return undefined;
    const request = dispatch(fetchBook(id));
    return () => request.abort();
  }, [dispatch, id, validId]);
  const retry = () => dispatch(fetchBook(id));
  if (!validId) return { data: null, loading: false, error: 'Buku tidak ditemukan.', status: 404, retry: null };
  if (detail.bookId !== String(id)) return { data: null, loading: true, error: null, retry };
  return { ...detail, retry };
}
