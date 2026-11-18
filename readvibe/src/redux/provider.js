'use client';

import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import http from '../services/http';
import { mapUser } from '../services/reader.api';
import { setCredentials, logout } from './slices/authSlice';
import { loadCatalog } from './slices/booksSlice';
import { loadReading } from './slices/readingSlice';
import { loadWishlist } from './slices/wishlistSlice';

function ReaderSession({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const catalog = useSelector((state) => state.books);
  const readingError = useSelector((state) => state.reading.error);
  const wishlistError = useSelector((state) => state.wishlist.error);
  const [sessionError, setSessionError] = useState('');
  const [retryVersion, setRetryVersion] = useState(0);
  useEffect(() => {
    dispatch(loadCatalog());
    const savedToken = localStorage.getItem('readvibe_token');
    if (!savedToken) return;
    let active = true;
    http.get('/api/auth/me').then((response) => {
      if (active && localStorage.getItem('readvibe_token') === savedToken) dispatch(setCredentials({ user: mapUser(response.data.user), token: savedToken }));
    }).catch((error) => {
      if (!active) return;
      if (error.statusCode === 401) dispatch(logout());
      else setSessionError(error.message);
    });
    return () => { active = false; };
  }, [dispatch, retryVersion]);
  useEffect(() => {
    if (!token) return;
    dispatch(loadReading());
    dispatch(loadWishlist());
  }, [dispatch, token]);
  const error = sessionError || catalog.error || readingError || wishlistError;
  return <>
    {catalog.status === 'loading' && <div role="status" className="px-3 py-2 small">Loading catalog…</div>}
    {error && <div role="alert" className="alert alert-danger m-3">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setSessionError(''); setRetryVersion((version) => version + 1); if (token) { dispatch(loadReading()); dispatch(loadWishlist()); } }}>Retry</button></div>}
    {children}
  </>;
}

export function ReduxProvider({ children }) {
  return <Provider store={store}><ReaderSession>{children}</ReaderSession></Provider>;
}

export default ReduxProvider;
