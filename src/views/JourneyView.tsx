import React, { useMemo, useState } from 'react';
import { useLifeThreads } from '../context/LifeThreadsContext';
import { parseReceiptDate, formatShortDate, formatDayKey, formatReceiptDate } from '../utils/dateUtils';
import { CATEGORY_THEMES, ALL_CATEGORIES } from '../utils/categoryTheme';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { MapPin, Calendar, Link2, Sparkles, Filter } from 'lucide-react';
import type { ReceiptCategory } from '../types';
import { cn } from '../utils/cn';

export const JourneyView: React.FC = () => {
  const { receipts, adjacencyMap, threads, openReceiptDetail } = useLifeThreads();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter receipts
  const filtered = useMemo(() => {
    let list = [...receipts].sort(
      (a, b) => parseReceiptDate(b.timestamp).getTime() - parseReceiptDate(a.timestamp).getTime()
    );
    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.category === selectedCategory);
    }
    return list;
  }, [receipts, selectedCategory]);

  // Group by day
  const groupedDays = useMemo(() => {
    const groups: { dayKey: string; dateLabel: string; items: typeof receipts }[] = [];
    let currentDay = '';
    let currentGroup: typeof receipts = [];

    filtered.forEach((r) => {
      const day = formatDayKey(r.timestamp);
      if (day !== currentDay) {
        if (currentGroup.length > 0) {
          groups.push({
            dayKey: currentDay,
            dateLabel: formatShortDate(currentDay),
            items: currentGroup,
          });
        }
        currentDay = day;
        currentGroup = [r];
      } else {
        currentGroup.push(r);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        dayKey: currentDay,
        dateLabel: formatShortDate(currentDay),
        items: currentGroup,
      });
    }

    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 max-w-4xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30 mb-2">
            <Calendar className="h-3 w-3" />
            <span>Chronological Journey Stream</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Linear Timeline with Non-Linear Bridges
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse sequential history while maintaining instant visibility into cross-timeline connections.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 shrink-0">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 focus:outline-none"
          >
            <option value="all" className="bg-zinc-900 text-white">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900 text-white">
                {CATEGORY_THEMES[cat].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative space-y-8 before:absolute before:left-4 sm:before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-cyan-500 before:via-zinc-700 before:to-transparent pl-8 sm:pl-12">
        {groupedDays.map((group) => (
          <div key={group.dayKey} className="space-y-4">
            {/* Day Header Marker */}
            <div className="sticky top-20 z-20 flex items-center gap-2 -ml-8 sm:-ml-12">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan-500 text-zinc-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/30">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="rounded-xl border border-zinc-800 bg-zinc-950/90 px-3 py-1 text-xs font-mono font-bold text-zinc-200 backdrop-blur-md shadow-md">
                {group.dateLabel} ({group.items.length} {group.items.length === 1 ? 'moment' : 'moments'})
              </span>
            </div>

            {/* Receipts of that day */}
            <div className="grid gap-3">
              {group.items.map((receipt) => {
                const theme = CATEGORY_THEMES[receipt.category];
                const Icon = theme.icon;
                const connections = adjacencyMap.get(receipt.id) || [];
                const inThread = threads.some((t) => t.receiptIds.includes(receipt.id));

                return (
                  <div
                    key={receipt.id}
                    onClick={() => openReceiptDetail(receipt.id)}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105',
                          theme.bgLight,
                          theme.borderColor
                        )}
                        style={{ color: theme.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={receipt.category} size="sm" showIcon={false} />
                          <span className="text-[11px] font-mono text-zinc-500">
                            {formatReceiptDate(receipt.timestamp)}
                          </span>
                          {inThread && (
                            <span className="flex items-center gap-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
                              <Sparkles className="h-2.5 w-2.5" />
                              Threaded
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold font-display text-zinc-100 group-hover:text-cyan-300 transition-colors truncate mt-0.5">
                          {receipt.title}
                        </h4>

                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {receipt.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400 shrink-0">
                      {receipt.location && (
                        <div className="flex items-center gap-1 text-rose-400 max-w-[160px] truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{receipt.location}</span>
                        </div>
                      )}

                      {connections.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-mono font-medium text-cyan-300 border border-zinc-700">
                          <Link2 className="h-3 w-3 text-cyan-400" />
                          {connections.length} {connections.length === 1 ? 'link' : 'links'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
