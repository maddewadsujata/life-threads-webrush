import React, { useState, useMemo } from 'react';
import { useLifeThreads } from '../context/LifeThreadsContext';
import { ThreadCard } from '../components/threads/ThreadCard';
import { EmptyState } from '../components/common/EmptyState';
import { Sparkles, Bookmark, Filter, GitFork, ArrowRight } from 'lucide-react';
import { ALL_CATEGORIES, CATEGORY_THEMES } from '../utils/categoryTheme';
import type { ReceiptCategory } from '../types';

export const ThreadsView: React.FC = () => {
  const { threads, favoriteThreadIds, setActiveTab } = useLifeThreads();
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (showOnlyBookmarks && !favoriteThreadIds.includes(t.id)) {
        return false;
      }
      if (selectedCategory !== 'all' && !t.categories.includes(selectedCategory as ReceiptCategory)) {
        return false;
      }
      return true;
    });
  }, [threads, showOnlyBookmarks, favoriteThreadIds, selectedCategory]);

  const avgConfidence = threads.length > 0
    ? Math.round(threads.reduce((acc, t) => acc + t.confidenceScore, 0) / threads.length)
    : 0;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 max-w-7xl mx-auto">
      {/* Header Description & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30 mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Deterministic Cluster Extraction</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Discovered Narrative Threads
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-1">
            Rather than a flat chronological list, these threads capture how distinct life moments
            naturally cluster around common locations, temporal windows, and shared context.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-center">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Threads</span>
            <span className="text-xl font-bold font-display text-white">{threads.length}</span>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-center">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Avg Confidence</span>
            <span className="text-xl font-bold font-display text-cyan-400">{avgConfidence}%</span>
          </div>
          <button
            onClick={() => setActiveTab('graph')}
            className="flex items-center gap-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-3 text-xs font-semibold transition-all"
          >
            <GitFork className="h-4 w-4" />
            <span className="hidden sm:inline">Graph View</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all" className="bg-zinc-900 text-white">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-900 text-white">
                  Involves {CATEGORY_THEMES[cat].name}
                </option>
              ))}
            </select>
          </div>

          {/* Bookmarks Toggle */}
          <button
            type="button"
            onClick={() => setShowOnlyBookmarks((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
              showOnlyBookmarks
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={showOnlyBookmarks ? 'currentColor' : 'none'} />
            <span>Bookmarked Only ({favoriteThreadIds.length})</span>
          </button>
        </div>

        <span className="text-xs font-mono text-zinc-500">
          Showing {filteredThreads.length} of {threads.length} threads
        </span>
      </div>

      {/* Threads Grid */}
      {filteredThreads.length === 0 ? (
        <EmptyState
          title="No Threads Match Your Selection"
          description="Try resetting the category filter or toggling bookmarks to see more discovered life threads."
          actionText="Show All Threads"
          onAction={() => {
            setShowOnlyBookmarks(false);
            setSelectedCategory('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
};
