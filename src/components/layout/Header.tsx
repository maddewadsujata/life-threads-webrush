import React, { useState } from 'react';
import {
  Search,
  Upload,
  Menu,
  X,
  Compass,
  Layers,
  Sparkles,
  GitFork,
  BookOpen,
  BarChart3,
  Calendar,
  Database,
} from 'lucide-react';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCommandPaletteOpen,
    setIsImportModalOpen,
    datasetSource,
    stats,
  } = useLifeThreads();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    landing: { title: 'Life Threads', subtitle: 'Deterministic Life Moment Intelligence' },
    overview: { title: 'Intelligence Overview', subtitle: 'At-a-glance ecosystem metrics & dynamic links' },
    explore: { title: 'Receipts Explorer', subtitle: 'Search, filter, and inspect verified digital receipts' },
    threads: { title: 'Discovered Threads', subtitle: 'Meaningful clusters and non-chronological narratives' },
    graph: { title: 'Relationship Network', subtitle: 'Interactive node graph of temporal & contextual affinity' },
    story: { title: 'Cinematic Story Mode', subtitle: 'Chapter-by-chapter progression of lived moments' },
    insights: { title: 'Life Insights & Analytics', subtitle: 'Empirical behavioral patterns and spatial anchors' },
    journey: { title: 'Timeline Journey', subtitle: 'Chronological timeline with connection cross-links' },
  };

  const currentInfo = tabTitles[activeTab] || tabTitles.overview;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'explore', label: 'Explore', icon: Layers },
    { id: 'threads', label: 'Threads', icon: Sparkles },
    { id: 'graph', label: 'Graph', icon: GitFork },
    { id: 'story', label: 'Story', icon: BookOpen },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'journey', label: 'Journey', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile hamburger + Active Section Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold font-display text-white tracking-tight truncate">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-zinc-400 truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick search, Dataset Pill, Import button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Search */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex min-h-[44px] sm:min-h-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
          aria-label="Search moments or jump to view (Command K)"
        >
          <Search className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          <span className="hidden sm:inline">Search (⌘K)</span>
        </button>

        {/* Dataset source pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-400">
          <Database className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
          <span className="font-mono text-[11px] text-zinc-300">
            {datasetSource === 'imported' ? 'Custom Dataset' : `Demo Set (${stats.totalReceipts})`}
          </span>
        </div>

        {/* Import Dataset Button */}
        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="flex min-h-[44px] sm:min-h-0 items-center gap-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all shadow-sm shadow-cyan-500/10"
          aria-label="Import custom CSV or JSON dataset"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Import</span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl lg:hidden animate-in slide-in-from-top-2">
          <nav aria-label="Mobile Navigation" className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2.5 rounded-xl p-2.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                    isActive
                      ? 'bg-zinc-900 text-cyan-300 font-semibold border border-zinc-800'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
