import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLifeThreads } from '../context/LifeThreadsContext';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { formatReceiptDate, formatShortDate, timeDifferenceFormatted } from '../utils/dateUtils';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { EmptyState } from '../components/common/EmptyState';
import { cn } from '../utils/cn';

export const StoryView: React.FC = () => {
  const { chapters, threads, openReceiptDetail, openThreadDetail, setActiveTab } = useLifeThreads();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];
  const isFirst = currentChapterIndex === 0;
  const isLast = currentChapterIndex === chapters.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentChapterIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Trigger celebratory confetti on completion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
      });
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentChapterIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation for chapters: Left and Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if not focused on an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, isLast, isFirst]);

  if (chapters.length === 0) {
    return (
      <div className="px-4 py-12 max-w-4xl mx-auto">
        <EmptyState
          title="No Story Chapters Assembled Yet"
          description="We need at least a few receipts with temporal or spatial links to compose narrative chapters."
          actionText="Go to Receipts Explorer"
          onAction={() => setActiveTab('explore')}
        />
      </div>
    );
  }

  const parentThread = currentChapter.threadId
    ? threads.find((t) => t.id === currentChapter.threadId)
    : null;

  return (
    <main className="relative min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-8 max-w-5xl mx-auto space-y-8">
      {/* Cinematic Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-cyan-300">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Cinematic Story Mode</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white">
          Your Story
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Connected moments become chapters. Raw digital receipts woven into chronological life arcs.
        </p>
      </div>

      {/* Progress Track & Step Indicators */}
      <nav aria-label="Story chapter navigation" className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full max-w-md text-xs font-mono text-zinc-400" aria-live="polite">
          <span className="text-cyan-400 font-bold">
            Chapter {String(currentChapterIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-zinc-600">/</span>
          <span>{String(chapters.length).padStart(2, '0')}</span>
        </div>

        {/* Segmented Progress Bar with buttons */}
        <div className="flex w-full max-w-md items-center gap-1.5 h-2">
          {chapters.map((ch, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentChapterIndex(idx)}
              aria-label={`Jump to Chapter ${idx + 1}: ${ch.title}`}
              aria-current={idx === currentChapterIndex ? 'step' : undefined}
              className={cn(
                'h-full flex-1 rounded-full cursor-pointer transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none',
                idx === currentChapterIndex
                  ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50'
                  : idx < currentChapterIndex
                  ? 'bg-cyan-900/80 hover:bg-cyan-700'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              )}
            />
          ))}
        </div>
      </nav>

      {/* The Active Chapter Stage */}
      <section
        aria-label={`Chapter ${currentChapter.number}: ${currentChapter.title}`}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8 animate-in fade-in duration-300"
      >
        {/* Subtle Ambient Backing Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" aria-hidden="true" />

        {/* Chapter Title & Subtitle */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 font-mono font-bold text-cyan-400 border border-cyan-500/30">
              Chapter {String(currentChapter.number).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
              <span>
                {formatShortDate(currentChapter.dateRange.start)}
                {currentChapter.dateRange.start !== currentChapter.dateRange.end &&
                  ` – ${formatShortDate(currentChapter.dateRange.end)}`}
              </span>
            </div>

            {currentChapter.locations.length > 0 && (
              <div className="flex items-center gap-1.5 text-rose-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{currentChapter.locations.slice(0, 2).join(' · ')}</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
            {currentChapter.title}
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            {currentChapter.subtitle}
          </p>
        </div>

        {/* The Natural Flow Narrative */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 text-sm text-zinc-200 leading-relaxed font-sans border-l-4 border-l-cyan-500">
          <p className="italic text-zinc-300">"{currentChapter.narrative}"</p>
        </div>

        {/* Sequential Visual Progression (Music -> Place -> Photo -> Purchase -> Event) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              <span>Chapter Timeline Flow ({currentChapter.receipts.length} moments)</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
              Click any moment to view evidence
            </span>
          </div>

          {/* Timeline Nodes Chain */}
          <div className="grid gap-3 sm:gap-4" role="feed" aria-label="Moments in chapter">
            {currentChapter.receipts.map((rcpt, idx) => {
              const theme = CATEGORY_THEMES[rcpt.category];
              const Icon = theme.icon;
              const nextRcpt = currentChapter.receipts[idx + 1];

              return (
                <article
                  key={rcpt.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Moment ${idx + 1}: ${rcpt.title} in ${rcpt.category}. Press enter to inspect receipt.`}
                  onClick={() => openReceiptDetail(rcpt.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openReceiptDetail(rcpt.id);
                    }
                  }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all duration-200 hover:border-cyan-500/50 hover:bg-zinc-900 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105',
                        theme.bgLight,
                        theme.borderColor
                      )}
                      style={{ color: theme.color }}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <time dateTime={rcpt.timestamp} className="text-xs font-mono text-zinc-500">
                          {formatReceiptDate(rcpt.timestamp)}
                        </time>
                        <CategoryBadge category={rcpt.category} size="sm" showIcon={false} />
                      </div>

                      <h4 className="text-sm font-semibold font-display text-zinc-100 group-hover:text-cyan-300 transition-colors truncate mt-0.5">
                        {rcpt.title}
                      </h4>

                      <p className="text-xs text-zinc-400 truncate mt-0.5">{rcpt.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-zinc-400 shrink-0">
                    {rcpt.location && (
                      <div className="flex items-center gap-1 text-rose-400 max-w-[160px] truncate">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{rcpt.location}</span>
                      </div>
                    )}

                    {nextRcpt && (
                      <span className="font-mono text-[11px] text-cyan-400/70 hidden sm:inline">
                        +{timeDifferenceFormatted(rcpt.timestamp, nextRcpt.timestamp)}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Chapter Insights & Grounding */}
        {currentChapter.keyInsights && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Observed Reality Checklist</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-zinc-300">
              {currentChapter.keyInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold" aria-hidden="true">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className="inline-flex min-h-[44px] sm:min-h-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none px-4 py-2.5 text-xs font-semibold text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Navigate to previous chapter"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Previous Chapter</span>
          </button>

          {parentThread && (
            <button
              type="button"
              onClick={() => openThreadDetail(parentThread)}
              className="inline-flex min-h-[44px] sm:min-h-0 items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
              aria-label={`Explore thread ${parentThread.title}`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Explore Underlying Thread</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex min-h-[44px] sm:min-h-0 items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-zinc-950 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all shadow-lg shadow-cyan-500/20"
            aria-label={isLast ? 'Complete journey and celebrate' : 'Navigate to next chapter'}
          >
            <span>{isLast ? 'Complete Journey ✨' : 'Next Chapter'}</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
};
