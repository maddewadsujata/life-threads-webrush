import type { Receipt, Thread, StoryChapter, ReceiptCategory } from '../types';
import { formatShortDate } from '../utils/dateUtils';

export function generateStoryChapters(receipts: Receipt[], threads: Thread[]): StoryChapter[] {
  if (receipts.length === 0) return [];

  const receiptMap = new Map<string, Receipt>();
  receipts.forEach((r) => receiptMap.set(r.id, r));

  // If we have discovered threads, convert the top threads into narrative chapters
  if (threads.length > 0) {
    return threads.map((thread, index) => {
      const chapterReceipts = thread.receiptIds
        .map((id) => receiptMap.get(id))
        .filter((r): r is Receipt => Boolean(r));

      const categories = Array.from(new Set(chapterReceipts.map((r) => r.category))) as ReceiptCategory[];
      const locations = Array.from(new Set(chapterReceipts.map((r) => r.location).filter(Boolean))) as string[];

      // Construct an evidence-grounded narrative step by step
      const stepNarratives: string[] = [];
      chapterReceipts.forEach((r, idx) => {
        if (idx === 0) {
          stepNarratives.push(`The sequence originates with ${r.category}: "${r.title}".`);
        } else if (idx === chapterReceipts.length - 1) {
          stepNarratives.push(`The thread concludes with a ${r.category} reflection: "${r.title}".`);
        } else {
          stepNarratives.push(`Next, an activity in ${r.category} occurs: "${r.title}".`);
        }
      });

      const keyInsights = [
        `${chapterReceipts.length} verified moments across ${categories.length} distinct digital categories`,
        locations.length > 0 ? `Anchored primarily in ${locations.slice(0, 2).join(' & ')}` : 'Distributed digital interactions',
        `Progression flow: ${categories.map((c) => c.toUpperCase()).join(' → ')}`,
        `Evidence confidence rating: ${thread.confidenceScore}% based on deterministic spatial and temporal convergence`,
      ];

      return {
        id: `chapter_${index + 1}`,
        number: index + 1,
        title: thread.title,
        subtitle: thread.subtitle || `A connected sequence of ${chapterReceipts.length} moments`,
        narrative: `${thread.narrative} ${stepNarratives.slice(0, 3).join(' ')}`,
        dateRange: thread.dateRange,
        locations,
        categories,
        receipts: chapterReceipts,
        threadId: thread.id,
        keyInsights,
      };
    });
  }

  // Fallback: If no clusters formed (e.g. very sparse dataset), partition chronologically
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const chunkSize = Math.max(3, Math.ceil(sorted.length / 4));
  const chapters: StoryChapter[] = [];

  for (let i = 0; i < sorted.length; i += chunkSize) {
    const slice = sorted.slice(i, i + chunkSize);
    const num = chapters.length + 1;
    const cats = Array.from(new Set(slice.map((s) => s.category))) as ReceiptCategory[];
    const locs = Array.from(new Set(slice.map((s) => s.location).filter(Boolean))) as string[];
    const start = slice[0].timestamp;
    const end = slice[slice.length - 1].timestamp;

    chapters.push({
      id: `chapter_fallback_${num}`,
      number: num,
      title: `Chronicle Part 0${num}`,
      subtitle: `Recorded timeline between ${formatShortDate(start)} and ${formatShortDate(end)}`,
      narrative: `During this period, ${slice.length} digital receipts were recorded spanning ${cats.join(', ')}.`,
      dateRange: { start, end },
      locations: locs,
      categories: cats,
      receipts: slice,
      keyInsights: [`${slice.length} chronologically contiguous moments`],
    });
  }

  return chapters;
}
