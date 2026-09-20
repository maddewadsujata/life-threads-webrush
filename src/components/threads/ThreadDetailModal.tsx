import React, { useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  ArrowDown,
} from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';
import { formatReceiptDate, formatShortDate, timeDifferenceFormatted } from '../../utils/dateUtils';
import { CategoryBadge } from '../common/CategoryBadge';
import { cn } from '../../utils/cn';

export const ThreadDetailModal: React.FC = () => {
  const { selectedThread, closeThreadDetail, receiptMap, openReceiptDetail } = useLifeThreads();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedThread) {
        closeThreadDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedThread, closeThreadDetail]);

  if (!selectedThread) return null;

  const receipts = selectedThread.receiptIds
    .map((id) => receiptMap.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div
      id="thread-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thread-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeThreadDetail}
    >
      <div
        id={`thread-modal-${selectedThread.id}`}
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-cyan-950/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-300 border border-cyan-500/30">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {selectedThread.confidenceScore}% Cohesion Rating
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              Thread ID: {selectedThread.id}
            </span>
          </div>

          <button
            type="button"
            onClick={closeThreadDetail}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Close thread details modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 space-y-7">
          {/* Header info */}
          <div>
            <h2 id="thread-detail-title" className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              {selectedThread.title}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {selectedThread.subtitle}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span>
                  {formatShortDate(selectedThread.dateRange.start)} –{' '}
                  {formatShortDate(selectedThread.dateRange.end)}
                </span>
              </div>

              {selectedThread.locations.length > 0 && (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{selectedThread.locations.join(' · ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <span className="text-zinc-500 uppercase tracking-wider font-mono block text-[10px]">
                Receipts Connected
              </span>
              <span className="text-xl font-bold font-display text-white mt-1 block">
                {receipts.length}
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <span className="text-zinc-500 uppercase tracking-wider font-mono block text-[10px]">
                Categories Involved
              </span>
              <span className="text-xl font-bold font-display text-white mt-1 block">
                {selectedThread.categories.length}
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <span className="text-zinc-500 uppercase tracking-wider font-mono block text-[10px]">
                Confidence Score
              </span>
              <span className="text-xl font-bold font-display text-cyan-400 mt-1 block">
                {selectedThread.confidenceScore}%
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
              <span className="text-zinc-500 uppercase tracking-wider font-mono block text-[10px]">
                Primary Anchor
              </span>
              <span className="text-sm font-semibold font-display text-zinc-200 mt-1 block truncate">
                {selectedThread.locations[0] || 'Digital Workspace'}
              </span>
            </div>
          </div>

          {/* Evidence Panel: "Why this thread exists" */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold font-display text-cyan-200 uppercase tracking-wider">
                Why This Thread Exists (Empirical Evidence)
              </h3>
            </div>

            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              {selectedThread.evidenceSummary.map((ev, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/80">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Visual Sequential Chain */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-display text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <span>The Narrative Flow Chain (Click Any Node to Inspect)</span>
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {receipts.length} progressive stages
              </span>
            </div>

            <div className="relative space-y-4 before:absolute before:left-[19px] sm:before:left-[27px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500/60 before:via-purple-500/40 before:to-emerald-500/60">
              {receipts.map((r, idx) => {
                const theme = CATEGORY_THEMES[r.category];
                const Icon = theme.icon;
                const nextReceipt = receipts[idx + 1];

                return (
                  <div key={r.id} className="relative flex items-start gap-3.5 sm:gap-5 group">
                    {/* Node Circle Badge */}
                    <div
                      className={cn(
                        'relative z-10 flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform duration-200 group-hover:scale-110 shadow-lg',
                        theme.bgLight,
                        theme.borderColor
                      )}
                      style={{ color: theme.color }}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Node Content Card */}
                    <article
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect step ${idx + 1}: ${r.title}`}
                      onClick={() => openReceiptDetail(r.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openReceiptDetail(r.id);
                        }
                      }}
                      className="flex-1 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:border-cyan-500/50 hover:bg-zinc-900 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={r.category} size="sm" />
                          <time dateTime={r.timestamp} className="text-xs font-mono text-zinc-500">
                            {formatReceiptDate(r.timestamp)}
                          </time>
                        </div>
                        {r.location && (
                          <div className="flex items-center gap-1 text-xs text-rose-400">
                            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-[200px]">{r.location}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="mt-2 text-sm sm:text-base font-semibold font-display text-zinc-100 group-hover:text-cyan-300 transition-colors">
                        {r.title}
                      </h4>

                      <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>

                      {/* Time delta to next node */}
                      {nextReceipt && (
                        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-cyan-400/80">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>{timeDifferenceFormatted(r.timestamp, nextReceipt.timestamp)} until next moment</span>
                          <ArrowDown className="h-3 w-3 ml-auto text-zinc-600" aria-hidden="true" />
                        </div>
                      )}
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-6 py-3.5 bg-zinc-900/40 text-xs">
          <span className="text-zinc-500 font-mono">
            {selectedThread.receiptIds.length} moments woven into this thread
          </span>
          <button
            type="button"
            onClick={closeThreadDetail}
            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 font-semibold text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
