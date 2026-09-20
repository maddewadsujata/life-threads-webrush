import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Compass,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatShortDate } from '../../utils/dateUtils';
import type { Receipt, Thread } from '../../types';

interface NavResult {
  type: 'nav';
  id: string;
  title: string;
  subtitle: string;
}

interface ThreadResult {
  type: 'thread';
  item: Thread;
  title: string;
  subtitle: string;
}

interface ReceiptResult {
  type: 'receipt';
  item: Receipt;
  title: string;
  subtitle: string;
}

type SearchResultItem = NavResult | ThreadResult | ReceiptResult;

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    receipts,
    threads,
    setActiveTab,
    openReceiptDetail,
    openThreadDetail,
  } = useLifeThreads();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // Search results
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Quick navigation items
      return [
        { type: 'nav', id: 'overview', title: 'Intelligence Overview', subtitle: 'View holistic metrics & insights' },
        { type: 'nav', id: 'explore', title: 'Receipts Explorer', subtitle: 'Filter by category and dates' },
        { type: 'nav', id: 'threads', title: 'Discovered Threads', subtitle: 'Browse narrative moment clusters' },
        { type: 'nav', id: 'graph', title: 'Relationship Network Graph', subtitle: 'Interactive node connectivity' },
        { type: 'nav', id: 'story', title: 'Cinematic Story Mode', subtitle: 'Chapter-based playback' },
        { type: 'nav', id: 'insights', title: 'Life Insights', subtitle: 'Analytics and behavioral peaks' },
      ];
    }

    const list: SearchResultItem[] = [];

    // Search threads
    threads.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)) {
        list.push({
          type: 'thread',
          item: t,
          title: t.title,
          subtitle: `${t.receiptIds.length} receipts · ${t.confidenceScore}% confidence`,
        });
      }
    });

    // Search receipts
    receipts.forEach((r) => {
      if (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        list.push({
          type: 'receipt',
          item: r,
          title: r.title,
          subtitle: `${r.category.toUpperCase()} · ${formatShortDate(r.timestamp)}${r.location ? ` · ${r.location}` : ''}`,
        });
      }
    });

    return list.slice(0, 15);
  }, [query, receipts, threads]);

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'nav') {
      setActiveTab(item.id);
    } else if (item.type === 'thread') {
      openThreadDetail(item.item);
    } else if (item.type === 'receipt') {
      openReceiptDetail(item.item.id);
    }
    setIsCommandPaletteOpen(false);
  };

  // Keyboard navigation up / down / enter / escape
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length === 0 ? 0 : (prev + 1) % results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length === 0 ? 0 : (prev - 1 + results.length) % results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, results, selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      id="command-palette-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search and command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-20 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-cyan-950/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-zinc-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-zinc-500 mr-3 shrink-0" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            aria-label="Search moments, locations, or threads"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search moments, locations, threads, or jump to view..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search text"
              onClick={() => setQuery('')}
              className="text-xs text-zinc-500 hover:text-zinc-300 p-1 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div
          role="listbox"
          aria-label="Search results"
          className="max-h-96 overflow-y-auto p-2 space-y-1"
        >
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching moments or threads found for "{query}".
            </div>
          ) : (
            results.map((res, idx) => (
              <div
                key={idx}
                role="option"
                aria-selected={idx === selectedIndex}
                tabIndex={0}
                onClick={() => handleSelect(res)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(res);
                  }
                }}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  idx === selectedIndex
                    ? 'bg-zinc-900 text-white border border-zinc-800'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {res.type === 'nav' && <Compass className="h-4 w-4 text-cyan-400 shrink-0" aria-hidden="true" />}
                  {res.type === 'thread' && <Sparkles className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />}
                  {res.type === 'receipt' && (
                    <CategoryBadge category={res.item.category} size="sm" showIcon={false} />
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{res.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{res.subtitle}</p>
                  </div>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 shrink-0 ml-2" aria-hidden="true" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/40 px-4 py-2 text-[10px] text-zinc-500 font-mono">
          <span>Use ↑ ↓ to navigate · Enter to select</span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-zinc-800 bg-zinc-950 px-1 py-0.5">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
