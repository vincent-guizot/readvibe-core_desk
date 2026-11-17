import { useEffect, useState } from 'react';
import http from '../services/http';

export function useApiQuery(path, params = {}) {
  const [state, setState] = useState({
    data: null,
    meta: null,
    loading: true,
    error: null,
  });
  const [version, setVersion] = useState(0);
  const query = JSON.stringify(params);
  const key = `${path}:${query}:${version}`;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    http
      .get(path, { params: JSON.parse(query), signal: controller.signal })
      .then((response) => {
        if (active)
          setState({
            key,
            data: response.data,
            meta: response.meta,
            loading: false,
            error: null,
          });
      })
      .catch((error) => {
        if (active)
          setState({
            key,
            data: null,
            meta: null,
            loading: false,
            error: error.message,
          });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [path, query, key]);
  const result =
    state.key === key
      ? state
      : { data: null, meta: null, loading: true, error: null };
  return { ...result, retry: () => setVersion((value) => value + 1) };
}
