import { useMemo, useState } from 'react';
import { normalizeSearch } from '../helpers/search';

export function useSearch(data, selectText) {
  const [search, setSearch] = useState('');
  const results = useMemo(() => {
    const query = normalizeSearch(search);
    return query ? data.filter((item) => normalizeSearch(selectText(item)).includes(query)) : data;
  }, [data, search, selectText]);
  return { search, setSearch, results };
}
