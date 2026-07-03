import { useState, useMemo, useEffect } from 'react';
import { searchService, SearchResult } from '@/services/SearchService';

/**
 * A hook to perform real-time filtering on local page data 
 * and optionally register it for global discovery.
 */
export function useLocalSearch<T>(
  data: T[] | undefined,
  searchFields: (keyof T)[],
  indexingOptions?: {
    type: 'INCIDENT' | 'ALERT' | 'INFRASTRUCTURE' | 'SERVICE' | 'SECURITY';
    getTitle: (item: T) => string;
    getSubtitle: (item: T) => string;
    getId: (item: T) => string;
    getHref: (item: T) => string;
  }
) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data;

    const query = searchTerm.toLowerCase().trim();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchTerm, searchFields]);

  useEffect(() => {
    if (data && indexingOptions) {
      const itemsToIndex: SearchResult[] = data.map((item) => ({
        id: indexingOptions.getId(item),
        type: indexingOptions.type,
        title: indexingOptions.getTitle(item),
        subtitle: indexingOptions.getSubtitle(item),
        href: indexingOptions.getHref(item),
      }));
      searchService.registerLocalData(itemsToIndex);
    }
  }, [data, indexingOptions]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
}
