import { useMemo, useState } from 'react';

export function useFilter(data, initialFilters, predicate) {
  const [filters, setFilters] = useState(initialFilters);
  const results = useMemo(() => data.filter((item) => predicate(item, filters)), [data, filters, predicate]);
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters(initialFilters);
  return { filters, setFilter, resetFilters, results };
}
