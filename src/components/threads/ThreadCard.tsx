import React from 'react';
import type { Thread } from '../../types';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';
import { formatShortDate } from '../../utils/dateUtils';
import { Sparkles, Calendar, MapPin, ArrowRight, Bookmark } from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { cn } from '../../utils/cn';

interface ThreadCardProps {
  thread: Thread;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const { openThreadDetail, favoriteThreadIds, toggleFavoriteThread } = useLifeThreads();
  const isBookmarked = favoriteThreadIds.includes(thread.id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openThreadDetail(thread);
    }
  };

  return (
    <article
      id={`thread-card-${thread.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Thread: ${thread.title}. ${thread.receiptIds.length} connected receipts with ${thread.confidenceScore}% confidence. Press enter to explore.`}
      onClick={() => openThreadDetail(thread)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-cyan-950/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
    >
      {/* Top ambient highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-40 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      />

      <div>
        {/* Header: Confidence Score + Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {thread.confidenceScore}% Confidence
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {thread.receiptIds.length} connected receipts
            </span>
          </div>

          <button
            type="button"
            aria-label={isBookmarked ? `Remove bookmark for ${thread.title}` : `Bookmark thread ${thread.title}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteThread(thread.id);
            }}
            className={cn(
              'rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
              isBookmarked ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
            )}
          >
            <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Title & Subtitle */}
        <h3 className="mt-3 text-lg font-bold font-display text-white group-hover:text-cyan-200 transition-colors">
          {thread.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{thread.subtitle}</p>

        {/* Date & Location Chips */}
        <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <Calendar className="h-3 w-3 text-zinc-500" aria-hidden="true" />
            <span>
              {formatShortDate(thread.dateRange.start)}
              {thread.dateRange.start !== thread.dateRange.end &&
                ` – ${formatShortDate(thread.dateRange.end)}`}
            </span>
          </div>

          {thread.locations.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-400 truncate max-w-[200px]">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{thread.locations[0]}</span>
            </div>
          )}
        </div>

        {/* Sequential Category Chain Preview */}
        <div className="mt-4 pt-3 border-t border-zinc-800/70">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
            Discovered Flow Sequence:
          </span>
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Sequence categories">
            {thread.categories.map((cat, idx) => {
              const theme = CATEGORY_THEMES[cat];
              const Icon = theme.icon;
              return (
                <React.Fragment key={cat + idx}>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium border',
                      theme.bgLight,
                      theme.textColor,
                      theme.borderColor
                    )}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    <span>{theme.name}</span>
                  </div>
                  {idx < thread.categories.length - 1 && (
                    <span className="text-zinc-600 text-xs" aria-hidden="true">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-zinc-800/70 pt-3 text-xs">
        <span className="text-zinc-500 text-[11px] line-clamp-1">
          {thread.evidenceSummary[0]}
        </span>
        <div className="inline-flex items-center gap-1.5 font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0 ml-2">
          <span>Explore Chain</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
};
