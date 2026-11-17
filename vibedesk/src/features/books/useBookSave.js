import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearBookFeedback, saveBook } from './booksSlice';
import { fetchResource } from '../workspace/workspaceSlice';

export function useBookSave(id) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const active = useRef(true);
  const previousFile = useRef(null);
  const state = useSelector((store) => store.books.save);
  useEffect(() => {
    active.current = true;
    dispatch(clearBookFeedback());
    return () => { active.current = false; };
  }, [dispatch, id]);
  const save = async (payload, coverFile) => {
    const uploadedCoverUrl = coverFile && previousFile.current === coverFile ? state.uploadedCoverUrl : null;
    previousFile.current = coverFile;
    const result = await dispatch(saveBook({ id, payload, coverFile, uploadedCoverUrl }));
    if (saveBook.fulfilled.match(result)) {
      dispatch(fetchResource('books'));
      if (active.current) navigate(`/books/${result.payload.id}`, { replace: true, state: { message: id ? 'Buku berhasil diperbarui.' : 'Buku berhasil ditambahkan.' } });
    }
  };
  return { ...state, save, clearError: () => dispatch(clearBookFeedback()) };
}
