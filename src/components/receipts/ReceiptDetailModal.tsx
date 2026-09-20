import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Link2,
  Sparkles,
  ExternalLink,
  Tag,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';
import { formatReceiptDate } from '../../utils/dateUtils';
import { CategoryBadge } from '../common/CategoryBadge';

export const ReceiptDetailModal: React.FC = () => {
  const {
    selectedReceipt,
    closeReceiptDetail,
    openReceiptDetail,
    adjacencyMap,
    receiptMap,
    threads,
    openThreadDetail,
  } = useLifeThreads();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedReceipt) {
        closeReceiptDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReceipt, closeReceiptDetail]);

  if (!selectedReceipt) return null;

  const theme = CATEGORY_THEMES[selectedReceipt.category] || CATEGORY_THEMES.notes;
  const connections = adjacencyMap.get(selectedReceipt.id) || [];
  const parentThread = threads.find((t) => t.receiptIds.includes(selectedReceipt.id));

  return (
    <div
      id="receipt-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeReceiptDetail}
    >
      <div
        id={`receipt-modal-${selectedReceipt.id}`}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <CategoryBadge category={selectedReceipt.category} size="md" />
            {parentThread && (
              <button
                type="button"
                aria-label={`Open thread: ${parentThread.title}`}
                onClick={() => {
                  closeReceiptDetail();
                  openThreadDetail(parentThread);
                }}
                className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span>{parentThread.title}</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={closeReceiptDetail}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Close receipt details modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Title & Time */}
          <div>
            <h2 id="receipt-detail-title" className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
              {selectedReceipt.title}
            </h2>

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                <time dateTime={selectedReceipt.timestamp}>{formatReceiptDate(selectedReceipt.timestamp)}</time>
              </div>

              {selectedReceipt.location && (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{selectedReceipt.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-2">
              Moment Log / Description
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed">{selectedReceipt.description}</p>
          </div>

          {/* Photo Preview if attached */}
          {selectedReceipt.metadata?.photoUrl && (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <img
                src={selectedReceipt.metadata.photoUrl}
                alt={`Photo for ${selectedReceipt.title}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="h-64 w-full object-cover"
              />
            </div>
          )}

          {/* Metadata Grid if available */}
          {selectedReceipt.metadata && Object.keys(selectedReceipt.metadata).length > 0 && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-3">
                Extracted Receipt Metadata
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {selectedReceipt.metadata.price !== undefined && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Amount / Price</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      ${Number(selectedReceipt.metadata.price).toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedReceipt.metadata.merchant && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Merchant / Venue</span>
                    <span className="text-zinc-200 font-medium">{selectedReceipt.metadata.merchant}</span>
                  </div>
                )}
                {selectedReceipt.metadata.artist && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Artist</span>
                    <span className="text-emerald-300 font-medium">{selectedReceipt.metadata.artist}</span>
                  </div>
                )}
                {selectedReceipt.metadata.album && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Album</span>
                    <span className="text-zinc-300 font-medium">{selectedReceipt.metadata.album}</span>
                  </div>
                )}
                {selectedReceipt.metadata.director && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Director</span>
                    <span className="text-purple-300 font-medium">{selectedReceipt.metadata.director}</span>
                  </div>
                )}
                {selectedReceipt.metadata.camera && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Camera Gear</span>
                    <span className="text-cyan-300 font-medium">{selectedReceipt.metadata.camera}</span>
                  </div>
                )}
                {selectedReceipt.metadata.query && (
                  <div className="col-span-2 rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Search Query</span>
                    <span className="text-yellow-300 font-mono">{selectedReceipt.metadata.query}</span>
                  </div>
                )}
                {selectedReceipt.metadata.recipient && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Recipient</span>
                    <span className="text-blue-300 font-medium">{selectedReceipt.metadata.recipient}</span>
                  </div>
                )}
                {selectedReceipt.metadata.mood && (
                  <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                    <span className="text-zinc-500 block">Observed Atmosphere</span>
                    <span className="text-zinc-300 capitalize">{selectedReceipt.metadata.mood}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {selectedReceipt.tags && selectedReceipt.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Receipt tags">
              <Tag className="h-3.5 w-3.5 text-zinc-500 mr-1" aria-hidden="true" />
              {selectedReceipt.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 border border-zinc-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* MOST IMPORTANT: "Why this connects" Evidence Section */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold font-display text-cyan-200">
                  Why This Connects (Evidence Engine)
                </h3>
              </div>
              <span className="text-xs font-medium text-cyan-400/80">
                {connections.length} deterministic links found
              </span>
            </div>

            {connections.length === 0 ? (
              <p className="mt-3 text-xs text-zinc-400">
                This receipt currently stands as an independent milestone with no immediate temporal or
                locational cluster in the active threshold.
              </p>
            ) : (
              <div className="mt-4 space-y-3" role="feed" aria-label="Connected receipts evidence">
                {connections.slice(0, 5).map((conn, idx) => {
                  const targetReceipt = receiptMap.get(conn.targetId);
                  if (!targetReceipt) return null;

                  return (
                    <article
                      key={idx}
                      role="button"
                      tabIndex={0}
                      aria-label={`Jump to connected receipt: ${targetReceipt.title} with ${conn.score}% match`}
                      onClick={() => openReceiptDetail(targetReceipt.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openReceiptDetail(targetReceipt.id);
                        }
                      }}
                      className="group flex flex-col gap-2 rounded-lg border border-zinc-800/90 bg-zinc-900/80 p-3.5 transition-all hover:border-cyan-500/40 hover:bg-zinc-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CategoryBadge category={targetReceipt.category} size="sm" />
                          <span className="text-xs font-semibold text-zinc-100 truncate group-hover:text-cyan-300 transition-colors">
                            {targetReceipt.title}
                          </span>
                        </div>
                        <span className="shrink-0 rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                          {conn.score}% match
                        </span>
                      </div>

                      {/* Evidence points breakdown */}
                      <ul className="space-y-1 text-xs text-zinc-400 pl-1 border-l-2 border-cyan-500/40">
                        {conn.evidence.map((ev, eIdx) => (
                          <li key={eIdx} className="flex items-center justify-between text-[11px]">
                            <span>• {ev.description}</span>
                            <span className="font-mono text-zinc-500">+{ev.score}pts</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-6 py-3.5 bg-zinc-900/40 text-xs text-zinc-500">
          <span className="font-mono">ID: {selectedReceipt.id}</span>
          <button
            type="button"
            onClick={closeReceiptDetail}
            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 font-medium text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
