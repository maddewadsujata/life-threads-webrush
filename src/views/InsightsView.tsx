import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Clock,
  Calendar,
  MapPin,
  GitFork,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useLifeThreads } from '../context/LifeThreadsContext';
import {
  computeHourlyDistribution,
  computeDayOfWeekStats,
  computeTopLocations,
  computeCategoryCorrelations,
  computeCategoryDistribution,
} from '../engine/insightEngine';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { formatShortDate } from '../utils/dateUtils';

export const InsightsView: React.FC = () => {
  const { receipts, connections, receiptMap, insights, openReceiptDetail } = useLifeThreads();

  const hourlyData = computeHourlyDistribution(receipts);
  const dayOfWeekData = computeDayOfWeekStats(receipts);
  const topLocations = computeTopLocations(receipts, 8);
  const categoryCorrelations = computeCategoryCorrelations(connections, receiptMap);
  const categoryShare = computeCategoryDistribution(receipts);

  // Late night vs daytime count
  const lateNightReceipts = receipts.filter((r) => {
    const h = new Date(r.timestamp).getHours();
    return h >= 23 || h <= 4;
  }).length;

  return (
    <div className="space-y-8 px-4 py-6 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30 mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Behavioral & Spatial Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Life Insights & Digital Footprint
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-1">
            Deterministic behavioral metrics computed directly from your timestamp clusters,
            spatial anchors, and cross-category correlation edges.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Late Night Ratio</span>
            <span className="text-lg font-bold font-display text-purple-400">
              {Math.round((lateNightReceipts / (receipts.length || 1)) * 100)}%
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">11 PM – 4 AM</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Unique Places</span>
            <span className="text-lg font-bold font-display text-rose-400">
              {topLocations.length}+
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Frequent Hubs</span>
          </div>
        </div>
      </div>

      {/* Dynamic Intelligence Highlights Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
          Discovered Behavioral Milestones
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              onClick={() => {
                if (ins.receiptIds && ins.receiptIds[0]) {
                  openReceiptDetail(ins.receiptIds[0]);
                }
              }}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all hover:border-cyan-500/40 hover:bg-zinc-900/70 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    {ins.title}
                  </span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-300">
                    {ins.metricValue}
                  </span>
                </div>
                <h4 className="mt-2 text-base font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                  {ins.headline}
                </h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{ins.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono truncate">
                {ins.evidence}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Row 1: Hourly Distribution (24-Hour Rhythm) */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>24-Hour Diurnal Activity Spectrum</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Distribution of digital moments by hour of day (highlights late-night peaks vs daytime workflows)
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Purple bars = Nocturnal window (11 PM - 4 AM)
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                interval={1}
              />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs shadow-xl">
                        <p className="font-mono text-cyan-400 font-bold">{data.label}</p>
                        <p className="text-zinc-200 mt-0.5">
                          {data.count} {data.count === 1 ? 'moment' : 'moments'} logged
                        </p>
                        {data.isLateNight && (
                          <p className="text-purple-400 text-[10px] font-mono mt-1">
                            • Late night window
                          </p>
                        )}
                        {data.isPeak && (
                          <p className="text-amber-400 text-[10px] font-mono mt-0.5">
                            • Peak activity zone
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isLateNight
                        ? '#8b5cf6'
                        : entry.isPeak
                        ? '#06b6d4'
                        : '#3b82f6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Day of Week Distribution & Category Correlations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day of Week Stats */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div>
            <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Weekly Cadence Distribution</span>
            </h4>
            <p className="text-xs text-zinc-400">Activity volume across weekdays and weekends</p>
          </div>

          <div className="space-y-3">
            {dayOfWeekData.map((d) => (
              <div key={d.dayName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{d.dayName}</span>
                  <span className="font-mono text-zinc-400">
                    {d.count} moments ({d.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Co-Occurrence Matrix */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div>
            <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
              <GitFork className="h-4 w-4 text-emerald-400" />
              <span>Category Co-Occurrence Affinity</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Pairings that exhibit the highest frequency of mutual temporal & spatial connections
            </p>
          </div>

          <div className="space-y-2.5">
            {categoryCorrelations.map((pair, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs"
              >
                <div className="flex items-center gap-2 font-display font-semibold text-zinc-200">
                  <CategoryBadge category={pair.cat1} size="sm" showIcon={false} />
                  <span className="text-zinc-500">↔</span>
                  <CategoryBadge category={pair.cat2} size="sm" showIcon={false} />
                </div>
                <span className="font-mono font-bold text-cyan-400">
                  {pair.count} verified links
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Spatial Anchors */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-400" />
              <span>Top Spatial Anchors & Frequent Venues</span>
            </h4>
            <p className="text-xs text-zinc-400">
              Locations ranked by repeated appearances across multiple categories
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {topLocations.map((loc, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span className="font-mono">#{idx + 1} Anchor</span>
                  <span className="font-mono text-rose-400 font-bold">{loc.count} receipts</span>
                </div>
                <h5 className="text-sm font-semibold font-display text-zinc-100 line-clamp-2">
                  {loc.name}
                </h5>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{loc.categories.length} categories</span>
                <span className="font-mono">{formatShortDate(loc.lastVisited)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
