import React from 'react';
import {
  Layers,
  Calendar,
  MapPin,
  GitFork,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useLifeThreads } from '../context/LifeThreadsContext';
import { MetricCard } from '../components/common/MetricCard';
import { ThreadCard } from '../components/threads/ThreadCard';
import { ReceiptCard } from '../components/receipts/ReceiptCard';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { computeCategoryDistribution } from '../engine/insightEngine';

export const OverviewView: React.FC = () => {
  const {
    stats,
    insights,
    threads,
    receipts,
    setActiveTab,
    openReceiptDetail,
    openThreadDetail,
  } = useLifeThreads();

  const categoryDistribution = computeCategoryDistribution(receipts);
  const topCategoryTheme = CATEGORY_THEMES[stats.mostActiveCategory];

  return (
    <div className="space-y-8 px-4 py-6 sm:px-8 max-w-7xl mx-auto">
      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          id="kpi-total-receipts"
          title="Total Receipts"
          value={stats.totalReceipts}
          subtitle="9 digital categories"
          icon={Layers}
          accentColor="#06b6d4"
          onClick={() => setActiveTab('explore')}
        />
        <MetricCard
          id="kpi-active-days"
          title="Active Days"
          value={stats.activeDays}
          subtitle="Logged lifecycle span"
          icon={Calendar}
          accentColor="#3b82f6"
          onClick={() => setActiveTab('journey')}
        />
        <MetricCard
          id="kpi-locations"
          title="Locations"
          value={stats.totalLocations}
          subtitle="Spatial anchors"
          icon={MapPin}
          accentColor="#f43f5e"
          onClick={() => setActiveTab('explore')}
        />
        <MetricCard
          id="kpi-connections"
          title="Connections"
          value={stats.connectionsDiscovered}
          subtitle="Deterministic links"
          icon={GitFork}
          accentColor="#8b5cf6"
          onClick={() => setActiveTab('graph')}
        />
        <MetricCard
          id="kpi-threads"
          title="Threads"
          value={threads.length}
          subtitle="Narrative clusters"
          icon={Sparkles}
          accentColor="#10b981"
          onClick={() => setActiveTab('threads')}
        />
        <MetricCard
          id="kpi-top-category"
          title="Top Category"
          value={topCategoryTheme.name}
          subtitle="Highest frequency"
          icon={topCategoryTheme.icon}
          accentColor={topCategoryTheme.color}
          onClick={() => setActiveTab('explore')}
        />
      </div>

      {/* Dynamic Intelligence Insights Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Deterministic Life Insights
            </h3>
            <p className="text-xs text-zinc-400">
              Discovered automatically through spatial, temporal, and metadata convergence
            </p>
          </div>
          <button
            onClick={() => setActiveTab('insights')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>Full Analytics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              onClick={() => {
                if (ins.receiptIds && ins.receiptIds[0]) {
                  openReceiptDetail(ins.receiptIds[0]);
                }
              }}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md transition-all duration-200 hover:border-cyan-500/40 hover:bg-zinc-900/80 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                    {ins.title}
                  </span>
                  <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-300 border border-zinc-700/60">
                    {ins.metricValue}
                  </span>
                </div>

                <h4 className="mt-2 text-base font-bold font-display text-zinc-100 group-hover:text-cyan-200 transition-colors">
                  {ins.headline}
                </h4>

                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {ins.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span className="truncate max-w-[220px]">{ins.evidence}</span>
                <span className="text-cyan-400 font-sans font-medium group-hover:underline shrink-0 ml-1">
                  Inspect
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discovered Narrative Threads Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Discovered Narrative Threads
            </h3>
            <p className="text-xs text-zinc-400">
              Moments that transcend chronological silos into unified real-life experiences
            </p>
          </div>
          <button
            onClick={() => setActiveTab('threads')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>View All ({threads.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {threads.slice(0, 3).map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Recent Moments */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category breakdown bar visualizer */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">
            Category Activity Share
          </h4>

          <div className="space-y-2.5">
            {categoryDistribution.map((item) => {
              const theme = CATEGORY_THEMES[item.category];
              const Icon = theme.icon;

              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" style={{ color: theme.color }} />
                      <span className="text-zinc-300 font-medium">{theme.name}</span>
                    </div>
                    <span className="font-mono text-zinc-400">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: theme.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Moments Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">
              Recent Moments Stream
            </h4>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Explore Full Archive
            </button>
          </div>

          <div className="space-y-2.5">
            {receipts.slice(0, 5).map((r) => (
              <ReceiptCard key={r.id} receipt={r} viewMode="list" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
