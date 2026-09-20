import React from 'react';
import { LifeThreadsProvider, useLifeThreads } from './context/LifeThreadsContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ImportModal } from './components/common/ImportModal';
import { ReceiptDetailModal } from './components/receipts/ReceiptDetailModal';
import { ThreadDetailModal } from './components/threads/ThreadDetailModal';
import { LandingView } from './views/LandingView';
import { OverviewView } from './views/OverviewView';
import { ExploreView } from './views/ExploreView';
import { ThreadsView } from './views/ThreadsView';
import { StoryView } from './views/StoryView';
import { InsightsView } from './views/InsightsView';
import { JourneyView } from './views/JourneyView';
import { RelationshipGraph } from './components/threads/RelationshipGraph';
import { GitFork, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, connections } = useLifeThreads();

  return (
    <div className="flex min-h-screen bg-[#090b10] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Permanent Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />

        <main className="flex-1 pb-16">
          {activeTab === 'landing' && <LandingView />}
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'explore' && <ExploreView />}
          {activeTab === 'threads' && <ThreadsView />}
          {activeTab === 'graph' && (
            <div className="space-y-6 px-4 py-6 sm:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30 mb-2">
                    <GitFork className="h-3 w-3" aria-hidden="true" />
                    <span>Cross-Temporal Relationship Network</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    Interactive Life Moment Graph
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Nodes represent receipts colored by category. Edge thickness represents connection strength.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-center text-xs font-mono">
                    <span className="text-zinc-500 block text-[10px]">Active Links</span>
                    <span className="font-bold text-cyan-400 text-sm">{connections.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('threads')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                    <span>View Narrative Clusters</span>
                  </button>
                </div>
              </div>

              <RelationshipGraph />
            </div>
          )}
          {activeTab === 'story' && <StoryView />}
          {activeTab === 'insights' && <InsightsView />}
          {activeTab === 'journey' && <JourneyView />}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <ReceiptDetailModal />
      <ThreadDetailModal />
      <ImportModal />
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LifeThreadsProvider>
        <AppContent />
      </LifeThreadsProvider>
    </ErrorBoundary>
  );
}
