import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * pageSize + 1, totalItems);
  const to = Math.min(page * pageSize, totalItems);

  // Build page number array with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white ${className}`}>
      {/* Results label */}
      <div className="hidden sm:flex sm:items-center">
        <p className="text-sm text-gray-600">
          Showing{' '}
          <span className="font-semibold text-gray-900">{from.toLocaleString()}</span>
          {' '}–{' '}
          <span className="font-semibold text-gray-900">{to.toLocaleString()}</span>
          {' '}of{' '}
          <span className="font-semibold text-gray-900">{totalItems.toLocaleString()}</span>
          {' '}results
        </p>
      </div>

      {/* Mobile: simple prev/next only */}
      <div className="flex sm:hidden items-center justify-between w-full">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Desktop: full page pills */}
      <nav className="hidden sm:flex items-center space-x-1" aria-label="Pagination">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-3 py-2 text-sm text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                p === page
                  ? 'bg-brand-600 text-white border border-brand-600 shadow-sm'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
