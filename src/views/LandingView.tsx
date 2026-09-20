import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  GitFork,
  BookOpen,
  Layers,
  CheckCircle2,
  Calendar,
  MapPin,
  Music,
  Camera,
  Film,
  ShoppingBag,
  MessageSquare,
  Search,
  FileText,
  Flame,
} from 'lucide-react';
import { useLifeThreads } from '../context/LifeThreadsContext';
import { ALL_CATEGORIES, CATEGORY_THEMES } from '../utils/categoryTheme';

export const LandingView: React.FC = () => {
  const { setActiveTab, setIsImportModalOpen, stats, threads, receipts } = useLifeThreads();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8 sm:px-8 sm:py-12 max-w-7xl mx-auto space-y-16">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-40 right-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]" />

      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-4 sm:pt-8 max-w-3xl mx-auto">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-500/10">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>WebRush 6-Hour Frontend Hackathon Entry</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
          Your Life, In <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Receipts.</span>
        </h1>

        {/* Philosophy progression: Raw Data -> Insights -> Connections -> Story */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono text-zinc-400 py-1">
          <span className="text-zinc-400">Raw Data</span>
          <span className="text-cyan-500 font-bold">→</span>
          <span className="text-zinc-300">Insights</span>
          <span className="text-cyan-500 font-bold">→</span>
          <span className="text-cyan-300">Connections</span>
          <span className="text-cyan-500 font-bold">→</span>
          <span className="text-white font-bold bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
            Story
          </span>
        </div>

        {/* Subtitle Description */}
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
          A person's digital life consists of hundreds of tiny moments—a song played at 2 AM,
          a place visited, a photo taken, a movie watched. Together, they form an interconnected narrative.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="inline-flex items-center gap-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3 text-sm font-bold text-zinc-950 transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95"
          >
            <span>Launch Intelligence Engine</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 px-6 py-3 text-sm font-semibold text-white transition-all backdrop-blur-md"
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Play Cinematic Story</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors"
          >
            <Database className="h-4 w-4 text-zinc-400" />
            <span>Load Custom Data</span>
          </button>
        </div>
      </div>

      {/* Dataset Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center backdrop-blur-md">
          <p className="text-xs font-mono uppercase text-zinc-400">Total Receipts</p>
          <p className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            {stats.totalReceipts}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Across 9 digital categories</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center backdrop-blur-md">
          <p className="text-xs font-mono uppercase text-zinc-400">Discovered Links</p>
          <p className="text-2xl sm:text-3xl font-bold font-display text-cyan-400 mt-1">
            {stats.connectionsDiscovered}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Scored deterministically</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center backdrop-blur-md">
          <p className="text-xs font-mono uppercase text-zinc-400">Narrative Threads</p>
          <p className="text-2xl sm:text-3xl font-bold font-display text-indigo-400 mt-1">
            {threads.length}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Cohesive clusters</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-center backdrop-blur-md">
          <p className="text-xs font-mono uppercase text-zinc-400">Unique Locations</p>
          <p className="text-2xl sm:text-3xl font-bold font-display text-rose-400 mt-1">
            {stats.totalLocations}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Spatial activity hubs</p>
        </div>
      </div>

      {/* The 9 Receipt Categories Grid */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="text-center space-y-1">
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400">
            Supported Data Surfaces
          </h3>
          <p className="text-xl font-bold font-display text-zinc-100">
            9 Facets of Modern Everyday Life
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {ALL_CATEGORIES.map((cat) => {
            const theme = CATEGORY_THEMES[cat];
            const Icon = theme.icon;
            const count = receipts.filter((r) => r.category === cat).length;

            return (
              <div
                key={cat}
                onClick={() => setActiveTab('explore')}
                className="group flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-center transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:scale-105 cursor-pointer"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 mb-2 transition-colors group-hover:border-zinc-700"
                  style={{ color: theme.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">{theme.name}</span>
                <span className="text-[10px] font-mono text-zinc-400 mt-0.5">{count} logged</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Architectural Highlights */}
      <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitFork className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold font-display text-white">
            Deterministic Engine
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No hallucinated AI assertions. Relationships are calculated in-browser using empirical
            time windows, exact locations, shared tags, and complementary categories.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold font-display text-white">
            Cinematic Story Chapters
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Transform isolated data points into progressive chapters. Experience the natural
            rhythm of Music → Place → Photo → Purchase → Event transitions.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Database className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold font-display text-white">
            Organizer Data Compatible
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Works right out of the box with the 112 curated moments, and seamlessly ingests any
            organizer CSV or JSON dataset via the client-side FileReader pipeline.
          </p>
        </div>
      </div>
    </div>
  );
};
