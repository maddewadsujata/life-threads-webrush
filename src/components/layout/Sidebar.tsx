import React from 'react';
import {
  Sparkles,
  Compass,
  GitFork,
  BookOpen,
  BarChart3,
  Calendar,
  Layers,
  Upload,
  Database,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { cn } from '../../utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCommandPaletteOpen,
    setIsImportModalOpen,
    stats,
    datasetSource,
    threads,
  } = useLifeThreads();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'explore', label: 'Receipts Explorer', icon: Layers, badge: stats.totalReceipts },
    { id: 'threads', label: 'Discovered Threads', icon: Sparkles, badge: threads.length },
    { id: 'graph', label: 'Relationship Graph', icon: GitFork },
    { id: 'story', label: 'Cinematic Story', icon: BookOpen, badge: stats.chaptersCount },
    { id: 'insights', label: 'Life Insights', icon: BarChart3 },
    { id: 'journey', label: 'Timeline Journey', icon: Calendar },
  ];

  return (
    <aside
      id="main-sidebar"
      aria-label="Main Navigation Sidebar"
      className="hidden lg:flex w-64 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950 p-4 shrink-0"
    >
      {/* Brand / Logo */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveTab('landing')}
          className="flex w-full items-center gap-3 group px-2 text-left rounded-xl focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          aria-label="Life Threads Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white font-display font-bold text-lg group-hover:scale-105 transition-transform" aria-hidden="true">
            LT
          </div>
          <div>
            <div className="text-base font-bold font-display text-white tracking-tight leading-tight flex items-center gap-1.5">
              <span>Life Threads</span>
              <span className="rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-1 py-0.2 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">WebRush 6-Hr Project</p>
          </div>
        </button>

        {/* Global Quick Search Button (Cmd+K) */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all shadow-sm"
          aria-label="Search moments or jump to view (Command K)"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <span>Search moments...</span>
          </div>
          <kbd className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            ⌘K
          </kbd>
        </button>

        {/* Navigation links */}
        <nav aria-label="Primary Navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                  isActive
                    ? 'bg-zinc-900 text-cyan-300 font-semibold shadow-sm border border-zinc-800/90'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-cyan-400' : 'text-zinc-500'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-mono',
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-zinc-800/80 text-zinc-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Dataset & Import Action */}
      <div className="space-y-3 pt-4 border-t border-zinc-800/80">
        {/* Dataset Status Pill */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              <span>Dataset Source</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium text-[10px]">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Active
            </span>
          </div>
          <p className="font-semibold text-zinc-200 truncate">
            {datasetSource === 'imported' ? 'Imported Custom Data' : 'Curated Hackathon Set'}
          </p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            {stats.totalReceipts} items · {stats.connectionsDiscovered} connections
          </p>
        </div>

        {/* Import Dataset Trigger Button */}
        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Import CSV / JSON</span>
        </button>
      </div>
    </aside>
  );
};
