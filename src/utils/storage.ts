import type { Receipt } from '../types';

const STORAGE_KEYS = {
  IMPORTED_RECEIPTS: 'lifethreads_imported_receipts_v1',
  FAVORITE_THREADS: 'lifethreads_favorite_threads_v1',
  READ_STORIES: 'lifethreads_read_stories_v1',
  DATASET_SOURCE: 'lifethreads_dataset_source_v1',
} as const;

export const storage = {
  /**
   * Safely loads and validates imported receipts from localStorage.
   */
  getImportedReceipts(): Receipt[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.IMPORTED_RECEIPTS);
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      // Validate basic shape of items
      const validReceipts = parsed.filter((item): item is Receipt => {
        return (
          item !== null &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.category === 'string' &&
          typeof item.title === 'string' &&
          typeof item.timestamp === 'string'
        );
      });

      return validReceipts.length > 0 ? validReceipts : null;
    } catch {
      return null;
    }
  },

  /**
   * Safely saves imported receipts to localStorage with Quota error handling.
   */
  saveImportedReceipts(receipts: Receipt[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.IMPORTED_RECEIPTS, JSON.stringify(receipts));
      localStorage.setItem(STORAGE_KEYS.DATASET_SOURCE, 'imported');
      return true;
    } catch (e: unknown) {
      console.warn('Storage quota exceeded or storage unavailable; retaining dataset in memory:', e);
      // Fallback: Still mark source as imported for current session
      try {
        localStorage.setItem(STORAGE_KEYS.DATASET_SOURCE, 'imported');
      } catch {
        // Ignored
      }
      return false;
    }
  },

  clearImportedReceipts(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.IMPORTED_RECEIPTS);
      localStorage.setItem(STORAGE_KEYS.DATASET_SOURCE, 'demo');
    } catch (e: unknown) {
      console.warn('Failed to clear receipts storage:', e);
    }
  },

  getDatasetSource(): 'demo' | 'imported' {
    try {
      const source = localStorage.getItem(STORAGE_KEYS.DATASET_SOURCE);
      return source === 'imported' ? 'imported' : 'demo';
    } catch {
      return 'demo';
    }
  },

  setDatasetSource(source: 'demo' | 'imported'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DATASET_SOURCE, source);
    } catch {
      // Ignored
    }
  },

  getFavoriteThreads(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITE_THREADS);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  },

  toggleFavoriteThread(threadId: string): string[] {
    const current = this.getFavoriteThreads();
    const updated = current.includes(threadId)
      ? current.filter((id) => id !== threadId)
      : [...current, threadId];
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITE_THREADS, JSON.stringify(updated));
    } catch {
      // Ignored
    }
    return updated;
  },

  getReadStoryIds(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.READ_STORIES);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  },

  markStoryRead(chapterId: string): void {
    try {
      const current = this.getReadStoryIds();
      if (!current.includes(chapterId)) {
        localStorage.setItem(STORAGE_KEYS.READ_STORIES, JSON.stringify([...current, chapterId]));
      }
    } catch (e: unknown) {
      console.warn('Failed to save story read state:', e);
    }
  },
};
