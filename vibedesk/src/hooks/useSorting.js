import { useMemo, useState } from 'react';

export function useSorting(data, comparators, initialSort) {
  const [sort, setSort] = useState(initialSort);
  const results = useMemo(() => comparators[sort] ? [...data].sort(comparators[sort]) : data, [data, comparators, sort]);
  return { sort, setSort, results };
}
