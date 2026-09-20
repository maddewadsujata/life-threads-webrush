import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type {
  Receipt,
  Connection,
  Thread,
  StoryChapter,
  DynamicInsight,
  DatasetStats,
  FilterState,
  ReceiptCategory,
} from '../types';
import { DEMO_RECEIPTS } from '../data/demoReceipts';
import { storage } from '../utils/storage';
import { buildConnectionNetwork } from '../engine/connectionEngine';
import { discoverThreads } from '../engine/threadDiscovery';
import { generateStoryChapters } from '../engine/storyEngine';
import { computeDatasetStats, generateDynamicInsights } from '../engine/insightEngine';
import { parseReceiptDate } from '../utils/dateUtils';
import { subDays, isAfter } from 'date-fns';

interface LifeThreadsContextType {
  receipts: Receipt[];
  datasetSource: 'demo' | 'imported';
  stats: DatasetStats;
  connections: Connection[];
  adjacencyMap: Map<string, Connection[]>;
  threads: Thread[];
  chapters: StoryChapter[];
  insights: DynamicInsight[];
  receiptMap: Map<string, Receipt>;

  // Navigation & View State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedReceipt: Receipt | null;
  openReceiptDetail: (receiptId: string) => void;
  closeReceiptDetail: () => void;
  selectedThread: Thread | null;
  openThreadDetail: (thread: Thread) => void;
  closeThreadDetail: () => void;

  // Modals & UI States
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;

  // Bookmarks
  favoriteThreadIds: string[];
  toggleFavoriteThread: (threadId: string) => void;

  // Data Actions
  loadImportedData: (newReceipts: Receipt[]) => void;
  resetToDemoData: () => void;

  // Filtering & Exploration
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredReceipts: Receipt[];
  resetFilters: () => void;
  availableLocations: string[];
}

const defaultFilters: FilterState = {
  searchQuery: '',
  categories: [],
  dateRange: 'all',
  location: 'all',
  sortBy: 'newest',
  viewMode: 'grid',
};

const LifeThreadsContext = createContext<LifeThreadsContextType | undefined>(undefined);

export const LifeThreadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize dataset from storage or fallback to demo receipts
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = storage.getImportedReceipts();
    return saved && saved.length > 0 ? saved : DEMO_RECEIPTS;
  });

  const [datasetSource, setDatasetSource] = useState<'demo' | 'imported'>(() => {
    const saved = storage.getImportedReceipts();
    return saved && saved.length > 0 ? 'imported' : 'demo';
  });

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [favoriteThreadIds, setFavoriteThreadIds] = useState<string[]>(() => storage.getFavoriteThreads());
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Fast map lookup
  const receiptMap = useMemo(() => {
    const map = new Map<string, Receipt>();
    receipts.forEach((r) => map.set(r.id, r));
    return map;
  }, [receipts]);

  // Deterministic Connection Network
  const { connections, adjacencyMap } = useMemo(() => {
    return buildConnectionNetwork(receipts, 30);
  }, [receipts]);

  // Discovered Threads
  const threads = useMemo(() => {
    return discoverThreads(receipts, connections, adjacencyMap);
  }, [receipts, connections, adjacencyMap]);

  // Story Chapters
  const chapters = useMemo(() => {
    return generateStoryChapters(receipts, threads);
  }, [receipts, threads]);

  // Dataset Stats
  const stats = useMemo(() => {
    return computeDatasetStats(receipts, connections, threads);
  }, [receipts, connections, threads]);

  // Dynamic Insight Cards
  const insights = useMemo(() => {
    return generateDynamicInsights(receipts, connections, threads);
  }, [receipts, connections, threads]);

  // Available locations for filter dropdown
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    receipts.forEach((r) => {
      if (r.location) locs.add(r.location);
    });
    return Array.from(locs).sort();
  }, [receipts]);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Search query across title, description, location, tags, metadata
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const inTitle = r.title.toLowerCase().includes(q);
        const inDesc = r.description.toLowerCase().includes(q);
        const inLoc = r.location ? r.location.toLowerCase().includes(q) : false;
        const inTags = r.tags.some((t) => t.toLowerCase().includes(q));
        const inArtist = r.metadata?.artist?.toLowerCase().includes(q) || false;
        const inVenue = r.metadata?.venue?.toLowerCase().includes(q) || false;
        const inMerchant = r.metadata?.merchant?.toLowerCase().includes(q) || false;

        if (!inTitle && !inDesc && !inLoc && !inTags && !inArtist && !inVenue && !inMerchant) {
          return false;
        }
      }

      // 2. Category multi-filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(r.category)) {
          return false;
        }
      }

      // 3. Location filter
      if (filters.location && filters.location !== 'all') {
        if (!r.location || r.location !== filters.location) {
          return false;
        }
      }

      // 4. Date range filter
      if (filters.dateRange !== 'all') {
        const d = parseReceiptDate(r.timestamp);
        const now = new Date(stats.dateRange.end || Date.now());

        if (filters.dateRange === '7d') {
          if (!isAfter(d, subDays(now, 7))) return false;
        } else if (filters.dateRange === '30d') {
          if (!isAfter(d, subDays(now, 30))) return false;
        } else if (filters.dateRange === '90d') {
          if (!isAfter(d, subDays(now, 90))) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'oldest') {
        return parseReceiptDate(a.timestamp).getTime() - parseReceiptDate(b.timestamp).getTime();
      }
      if (filters.sortBy === 'connections') {
        const connsA = adjacencyMap.get(a.id)?.length || 0;
        const connsB = adjacencyMap.get(b.id)?.length || 0;
        return connsB - connsA;
      }
      // default newest
      return parseReceiptDate(b.timestamp).getTime() - parseReceiptDate(a.timestamp).getTime();
    });
  }, [receipts, filters, stats.dateRange.end, adjacencyMap]);

  const openReceiptDetail = useCallback((receiptId: string) => {
    const found = receiptMap.get(receiptId);
    if (found) {
      setSelectedReceipt(found);
    }
  }, [receiptMap]);

  const closeReceiptDetail = useCallback(() => {
    setSelectedReceipt(null);
  }, []);

  const openThreadDetail = useCallback((thread: Thread) => {
    setSelectedThread(thread);
  }, []);

  const closeThreadDetail = useCallback(() => {
    setSelectedThread(null);
  }, []);

  const toggleFavorite = useCallback((threadId: string) => {
    const updated = storage.toggleFavoriteThread(threadId);
    setFavoriteThreadIds(updated);
  }, []);

  const loadImportedData = useCallback((newReceipts: Receipt[]) => {
    storage.saveImportedReceipts(newReceipts);
    setReceipts(newReceipts);
    setDatasetSource('imported');
    setFilters(defaultFilters);
    setActiveTab('overview');
  }, []);

  const resetToDemoData = useCallback(() => {
    storage.clearImportedReceipts();
    setReceipts(DEMO_RECEIPTS);
    setDatasetSource('demo');
    setFilters(defaultFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Global Keyboard Shortcut: Cmd/Ctrl + K for search command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setSelectedReceipt(null);
        setSelectedThread(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSetActiveTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleSetIsCommandPaletteOpen = useCallback((open: boolean) => {
    setIsCommandPaletteOpen(open);
  }, []);

  const handleSetIsImportModalOpen = useCallback((open: boolean) => {
    setIsImportModalOpen(open);
  }, []);

  const contextValue = useMemo<LifeThreadsContextType>(() => ({
    receipts,
    datasetSource,
    stats,
    connections,
    adjacencyMap,
    threads,
    chapters,
    insights,
    receiptMap,
    activeTab,
    setActiveTab: handleSetActiveTab,
    selectedReceipt,
    openReceiptDetail,
    closeReceiptDetail,
    selectedThread,
    openThreadDetail,
    closeThreadDetail,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen: handleSetIsCommandPaletteOpen,
    isImportModalOpen,
    setIsImportModalOpen: handleSetIsImportModalOpen,
    favoriteThreadIds,
    toggleFavoriteThread: toggleFavorite,
    loadImportedData,
    resetToDemoData,
    filters,
    setFilters,
    filteredReceipts,
    resetFilters,
    availableLocations,
  }), [
    receipts,
    datasetSource,
    stats,
    connections,
    adjacencyMap,
    threads,
    chapters,
    insights,
    receiptMap,
    activeTab,
    handleSetActiveTab,
    selectedReceipt,
    openReceiptDetail,
    closeReceiptDetail,
    selectedThread,
    openThreadDetail,
    closeThreadDetail,
    isCommandPaletteOpen,
    handleSetIsCommandPaletteOpen,
    isImportModalOpen,
    handleSetIsImportModalOpen,
    favoriteThreadIds,
    toggleFavorite,
    loadImportedData,
    resetToDemoData,
    filters,
    filteredReceipts,
    resetFilters,
    availableLocations,
  ]);

  return (
    <LifeThreadsContext.Provider value={contextValue}>
      {children}
    </LifeThreadsContext.Provider>
  );
};

export function useLifeThreads() {
  const context = useContext(LifeThreadsContext);
  if (!context) {
    throw new Error('useLifeThreads must be used within a LifeThreadsProvider');
  }
  return context;
}
