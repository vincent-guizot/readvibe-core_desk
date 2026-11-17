import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants/api';

export function usePagination(data, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const activePage = Math.min(page, pageCount);
  return {
    page: activePage, setPage, pageCount,
    results: data.slice((activePage - 1) * pageSize, activePage * pageSize),
  };
}
