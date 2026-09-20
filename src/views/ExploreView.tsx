import React, { useState, useMemo } from 'react';
import { useLifeThreads } from '../context/LifeThreadsContext';
import { FilterToolbar } from '../components/receipts/FilterToolbar';
import { ReceiptCard } from '../components/receipts/ReceiptCard';
import { EmptyState } from '../components/common/EmptyState';
import { Layers, ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export const ExploreView: React.FC = () => {
  const { filteredReceipts, filters, resetFilters, setIsImportModalOpen } = useLifeThreads();
  const [page, setPage] = useState<number>(1);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const displayedReceipts = useMemo(() => {
    return filteredReceipts.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredReceipts, page]);

  const hasMore = displayedReceipts.length < filteredReceipts.length;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 max-w-7xl mx-auto">
      {/* Search & Filter Toolbar */}
      <FilterToolbar />

      {/* Main Content: Receipts Grid/List or Empty State */}
      {filteredReceipts.length === 0 ? (
        <EmptyState
          title="No Receipts Match Your Filter Criteria"
          description="Try clearing some category tags, expanding your date horizon, or resetting the keyword search."
          actionText="Reset All Filters"
          onAction={resetFilters}
          secondaryActionText="Import Custom Dataset"
          onSecondaryAction={() => setIsImportModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {filters.viewMode === 'list' ? (
            <div className="space-y-2.5">
              {displayedReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedReceipts.map((receipt) => (
                <ReceiptCard key={receipt.id} receipt={receipt} viewMode="grid" />
              ))}
            </div>
          )}

          {/* Load More Button if paginated */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 px-6 py-2.5 text-xs font-semibold text-zinc-200 transition-colors shadow-lg"
              >
                <span>Load More Moments ({filteredReceipts.length - displayedReceipts.length} remaining)</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
