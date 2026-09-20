import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  MapPin,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { ALL_CATEGORIES, CATEGORY_THEMES } from '../../utils/categoryTheme';
import type { ReceiptCategory } from '../../types';
import { cn } from '../../utils/cn';

export const FilterToolbar: React.FC = () => {
  const {
    filters,
    setFilters,
    filteredReceipts,
    receipts,
    availableLocations,
    resetFilters,
  } = useLifeThreads();

  const handleCategoryToggle = (category: ReceiptCategory) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.categories.length > 0 ||
    filters.dateRange !== 'all' ||
    filters.location !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <div className="space-y-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5 backdrop-blur-md">
      {/* Top row: Search input + View Mode + Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <label htmlFor="receipt-search-input" className="sr-only">
            Search moments, artists, locations, or notes
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" aria-hidden="true" />
          <input
            id="receipt-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search receipts, artists, places, quotes, items, notes..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 py-2.5 pl-10 pr-14 text-sm text-zinc-100 placeholder-zinc-500 focus:border-cyan-500/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/60 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 px-1 py-0.5 rounded focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              aria-label="Clear search input"
            >
              Clear
            </button>
          )}
        </div>

        {/* Controls: Date Range, Location, Sort & View Mode */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Date range filter */}
          <div className="relative">
            <label htmlFor="filter-date-range" className="sr-only">Filter by date range</label>
            <select
              id="filter-date-range"
              value={filters.dateRange}
              aria-label="Filter receipts by date range"
              onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value as 'all' | '7d' | '30d' | '90d' }))}
              className="min-h-[44px] sm:min-h-0 appearance-none rounded-xl border border-zinc-800 bg-zinc-950/70 py-2 pl-3 pr-8 text-xs text-zinc-300 hover:border-zinc-700 focus:border-cyan-500/60 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          </div>

          {/* Location filter */}
          <div className="relative max-w-[150px] sm:max-w-[180px]">
            <label htmlFor="filter-location" className="sr-only">Filter by location</label>
            <select
              id="filter-location"
              value={filters.location}
              aria-label="Filter receipts by location"
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
              className="min-h-[44px] sm:min-h-0 w-full truncate appearance-none rounded-xl border border-zinc-800 bg-zinc-950/70 py-2 pl-3 pr-8 text-xs text-zinc-300 hover:border-zinc-700 focus:border-cyan-500/60 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          </div>

          {/* Sort selector */}
          <div className="relative">
            <label htmlFor="filter-sort" className="sr-only">Sort receipts</label>
            <select
              id="filter-sort"
              value={filters.sortBy}
              aria-label="Sort receipts by order"
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as 'newest' | 'oldest' | 'connections' }))}
              className="min-h-[44px] sm:min-h-0 appearance-none rounded-xl border border-zinc-800 bg-zinc-950/70 py-2 pl-3 pr-8 text-xs text-zinc-300 hover:border-zinc-700 focus:border-cyan-500/60 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="connections">Most Connected</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950/70 p-1" role="group" aria-label="Receipt layout mode">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'grid' }))}
              className={cn(
                'min-h-[38px] sm:min-h-0 rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                filters.viewMode === 'grid'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
              aria-label="Switch to grid layout"
              aria-pressed={filters.viewMode === 'grid'}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'list' }))}
              className={cn(
                'min-h-[38px] sm:min-h-0 rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                filters.viewMode === 'list'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
              aria-label="Switch to list layout"
              aria-pressed={filters.viewMode === 'list'}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex min-h-[44px] sm:min-h-0 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-400 hover:border-zinc-700 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
              aria-label="Reset all active filters"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/60" role="group" aria-label="Filter by categories">
        <span className="text-xs text-zinc-500 mr-1 font-mono uppercase tracking-wider">
          Categories:
        </span>
        {ALL_CATEGORIES.map((cat) => {
          const theme = CATEGORY_THEMES[cat];
          const isSelected = filters.categories.includes(cat);
          const Icon = theme.icon;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryToggle(cat)}
              aria-pressed={isSelected}
              className={cn(
                'min-h-[36px] sm:min-h-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 border focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                isSelected
                  ? cn(theme.bgLight, theme.textColor, theme.borderColor, 'shadow-sm font-semibold')
                  : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              )}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
              <span>{theme.name}</span>
            </button>
          );
        })}
      </div>

      {/* Showing Result Count (aria-live region) */}
      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono" aria-live="polite">
        <span>
          Showing <span className="font-semibold text-zinc-300">{filteredReceipts.length}</span> of{' '}
          <span className="text-zinc-300">{receipts.length}</span> receipts
        </span>
        {hasActiveFilters && (
          <span className="text-cyan-400 font-sans text-[11px]">Filtered view active</span>
        )}
      </div>
    </div>
  );
};
