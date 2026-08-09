import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setPaginationFromResponse: (pagination: { page: number; limit: number; totalItems: number; totalPages: number }) => void;
  /** Call this whenever filters/search change — resets to page 1 */
  resetPage: () => void;
}

export function usePagination(initialLimit = 20): UsePaginationReturn {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const setPage = useCallback((p: number) => {
    setPageState(p);
  }, []);

  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPageState(1); // Reset to first page when page size changes
  }, []);

  const setPaginationFromResponse = useCallback(
    (pagination: { page: number; limit: number; totalItems: number; totalPages: number }) => {
      setPageState(pagination.page);
      setLimitState(pagination.limit);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
    },
    []
  );

  const resetPage = useCallback(() => {
    setPageState(1);
  }, []);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    setPage,
    setLimit,
    setPaginationFromResponse,
    resetPage,
  };
}
