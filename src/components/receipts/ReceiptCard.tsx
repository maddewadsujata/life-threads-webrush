import React from 'react';
import type { Receipt } from '../../types';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';
import { formatReceiptDate } from '../../utils/dateUtils';
import { CategoryBadge } from '../common/CategoryBadge';
import { MapPin, Link2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { cn } from '../../utils/cn';

interface ReceiptCardProps {
  receipt: Receipt;
  viewMode?: 'grid' | 'list';
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, viewMode = 'grid' }) => {
  const { openReceiptDetail, adjacencyMap, threads } = useLifeThreads();
  const theme = CATEGORY_THEMES[receipt.category] || CATEGORY_THEMES.notes;
  const connections = adjacencyMap.get(receipt.id) || [];
  const connectionCount = connections.length;

  const belongsToThread = threads.some((t) => t.receiptIds.includes(receipt.id));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openReceiptDetail(receipt.id);
    }
  };

  if (viewMode === 'list') {
    return (
      <article
        id={`rcpt-row-${receipt.id}`}
        role="button"
        tabIndex={0}
        aria-label={`View receipt details for ${receipt.title}`}
        onClick={() => openReceiptDetail(receipt.id)}
        onKeyDown={handleKeyDown}
        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors group-hover:border-zinc-700"
            style={{ color: theme.color }}
            aria-hidden="true"
          >
            <theme.icon className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100 truncate group-hover:text-cyan-300 transition-colors font-display">
                {receipt.title}
              </span>
              {belongsToThread && (
                <span className="flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="h-2.5 w-2.5" />
                  Thread
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{receipt.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-zinc-400 justify-between sm:justify-end">
          {receipt.location && (
            <div className="flex items-center gap-1 text-zinc-400 truncate max-w-[160px]">
              <MapPin className="h-3 w-3 shrink-0 text-rose-400" aria-hidden="true" />
              <span className="truncate">{receipt.location}</span>
            </div>
          )}

          <time dateTime={receipt.timestamp} className="text-zinc-500 whitespace-nowrap">
            {formatReceiptDate(receipt.timestamp)}
          </time>

          {connectionCount > 0 && (
            <span
              aria-label={`${connectionCount} connections discovered`}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/60"
            >
              <Link2 className="h-3 w-3 text-cyan-400" aria-hidden="true" />
              {connectionCount}
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      id={`rcpt-card-${receipt.id}`}
      role="button"
      tabIndex={0}
      aria-label={`View receipt details for ${receipt.title}`}
      onClick={() => openReceiptDetail(receipt.id)}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5 backdrop-blur-md transition-all duration-300',
        'hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-black/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none'
      )}
    >
      {/* Top ambient color edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.color} 50%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      <div>
        {/* Header: Category Badge + Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={receipt.category} size="sm" />
          <time dateTime={receipt.timestamp} className="text-[11px] font-mono text-zinc-500">
            {formatReceiptDate(receipt.timestamp)}
          </time>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-sm sm:text-base font-semibold text-zinc-100 transition-colors group-hover:text-cyan-300 line-clamp-2 font-display leading-snug">
          {receipt.title}
        </h3>

        {/* Location if present */}
        {receipt.location && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" aria-hidden="true" />
            <span className="truncate">{receipt.location}</span>
          </div>
        )}

        {/* Description */}
        <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
          {receipt.description}
        </p>

        {/* Tags */}
        {receipt.tags && receipt.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1" aria-label="Tags">
            {receipt.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400"
              >
                #{tag}
              </span>
            ))}
            {receipt.tags.length > 3 && (
              <span className="text-[10px] font-mono text-zinc-500 self-center">
                +{receipt.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Thread indicator and connections count */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/70 pt-3 text-xs text-zinc-400">
        <div>
          {belongsToThread ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              In Thread
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500">Individual Moment</span>
          )}
        </div>

        {connectionCount > 0 ? (
          <span
            aria-label={`${connectionCount} discovered connections`}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/60 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors"
          >
            <Link2 className="h-3 w-3 text-cyan-400" aria-hidden="true" />
            {connectionCount} {connectionCount === 1 ? 'link' : 'links'}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-600">No links</span>
        )}
      </div>
    </article>
  );
};
