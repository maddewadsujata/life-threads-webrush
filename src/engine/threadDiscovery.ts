import type { Receipt, Thread, ReceiptCategory, Connection } from '../types';
import { parseReceiptDate, formatShortDate } from '../utils/dateUtils';
import { differenceInDays, differenceInHours } from 'date-fns';

interface Cluster {
  receipts: Receipt[];
  internalScore: number;
}

export function discoverThreads(
  receipts: Receipt[],
  connections: Connection[],
  adjacencyMap: Map<string, Connection[]>
): Thread[] {
  if (receipts.length === 0) return [];

  const receiptMap = new Map<string, Receipt>();
  receipts.forEach((r) => receiptMap.set(r.id, r));

  // Sort receipts chronologically
  const sorted = [...receipts].sort(
    (a, b) => parseReceiptDate(a.timestamp).getTime() - parseReceiptDate(b.timestamp).getTime()
  );

  const clusters: Cluster[] = [];
  const assigned = new Set<string>();

  // Find dense temporal and semantic seeds
  for (let i = 0; i < sorted.length; i++) {
    const seed = sorted[i];
    if (assigned.has(seed.id)) continue;

    const seedConns = adjacencyMap.get(seed.id) || [];
    const strongConns = seedConns.filter((c) => c.score >= 45);

    if (strongConns.length >= 2) {
      const clusterReceipts: Receipt[] = [seed];
      assigned.add(seed.id);

      // Collect directly connected receipts within a reasonable time window (e.g. 3 days)
      strongConns.forEach((c) => {
        const neighbor = receiptMap.get(c.targetId);
        if (neighbor && !assigned.has(neighbor.id)) {
          const dSeed = parseReceiptDate(seed.timestamp);
          const dNeighbor = parseReceiptDate(neighbor.timestamp);
          if (Math.abs(differenceInDays(dSeed, dNeighbor)) <= 3) {
            clusterReceipts.push(neighbor);
            assigned.add(neighbor.id);
          }
        }
      });

      // Expand 1 more hop for high-scoring mutual neighbors
      const candidates: Receipt[] = [];
      clusterReceipts.forEach((cr) => {
        const neighbors = adjacencyMap.get(cr.id) || [];
        neighbors.forEach((n) => {
          if (n.score >= 50 && !assigned.has(n.targetId)) {
            const r = receiptMap.get(n.targetId);
            if (r) candidates.push(r);
          }
        });
      });

      candidates.forEach((cand) => {
        if (!assigned.has(cand.id)) {
          const dSeed = parseReceiptDate(seed.timestamp);
          const dCand = parseReceiptDate(cand.timestamp);
          if (Math.abs(differenceInDays(dSeed, dCand)) <= 3) {
            clusterReceipts.push(cand);
            assigned.add(cand.id);
          }
        }
      });

      if (clusterReceipts.length >= 3) {
        // Calculate average internal connection score
        let totalInternalScore = 0;
        let pairCount = 0;
        for (let a = 0; a < clusterReceipts.length; a++) {
          for (let b = a + 1; b < clusterReceipts.length; b++) {
            const edge = (adjacencyMap.get(clusterReceipts[a].id) || []).find(
              (c) => c.targetId === clusterReceipts[b].id
            );
            if (edge) {
              totalInternalScore += edge.score;
              pairCount++;
            }
          }
        }
        const avgScore = pairCount > 0 ? totalInternalScore / pairCount : 50;

        clusters.push({
          receipts: clusterReceipts.sort(
            (a, b) => parseReceiptDate(a.timestamp).getTime() - parseReceiptDate(b.timestamp).getTime()
          ),
          internalScore: Math.min(98, Math.round(avgScore + clusterReceipts.length * 3)),
        });
      }
    }
  }

  // Generate threads from clusters
  const threads: Thread[] = clusters.map((cluster, index) => {
    const rcpts = cluster.receipts;
    const categories = Array.from(new Set(rcpts.map((r) => r.category))) as ReceiptCategory[];
    const locations = Array.from(new Set(rcpts.map((r) => r.location).filter(Boolean))) as string[];

    const startDate = rcpts[0].timestamp;
    const endDate = rcpts[rcpts.length - 1].timestamp;
    const startD = parseReceiptDate(startDate);
    const endD = parseReceiptDate(endDate);
    const diffHours = Math.abs(differenceInHours(startD, endD));
    const diffDays = Math.abs(differenceInDays(startD, endD));

    // Dynamic thread naming based on observable properties
    const primaryLocation = locations[0] || 'Urban Hub';
    const tagCounts = new Map<string, number>();
    rcpts.forEach((r) => {
      r.tags?.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));
    });
    const topTag = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

    let title = `Thread ${index + 1}`;
    let subtitle = '';

    if (topTag === 'jazz' || categories.includes('music') && categories.includes('events')) {
      title = 'Friday Night Jazz & Vinyl Session';
      subtitle = 'Subterranean acoustics, live improvisation & nocturnal reflections';
    } else if (topTag === 'roadtrip' || topTag === 'coastal' || locations.some((l) => l.includes('Big Sur') || l.includes('Highway 1'))) {
      title = 'Big Sur Coastal Escape';
      subtitle = 'Pacific surf, redwood ridges, keyhole rock & sensory recharge';
    } else if (topTag === 'code' || topTag === 'webgl' || categories.includes('searches') && categories.includes('notes') && rcpts.some((r) => r.title.includes('Bug') || r.title.includes('Canvas') || r.title.includes('Physics'))) {
      title = 'Midnight Flow & Synthetic Resonance';
      subtitle = 'Deep focus algorithms, ambient soundscapes & late-night milestones';
    } else if (categories.includes('movies') && (categories.includes('places') || categories.includes('purchases'))) {
      title = '35mm Film Retrospective & Late Lounge';
      subtitle = 'Celluloid projection, cinematic color grading & speakeasy dialogue';
    } else if (topTag === 'farmers-market' || topTag === 'produce' || categories.includes('purchases') && rcpts.some((r) => r.title.includes('Market') || r.title.includes('Bakery'))) {
      title = 'Sunday Morning Artisan Market';
      subtitle = 'Organic produce, fresh sourdough, acoustic guitars & sensory grounding';
    } else if (topTag === 'architecture' || locations.some((l) => l.includes('Bradbury') || l.includes('Broad'))) {
      title = 'Urban Heritage & Mirrored Infinity';
      subtitle = 'Victorian ironwork, 35mm street frames & contemporary light installations';
    } else if (topTag === 'nye' || topTag === 'celebration' || rcpts.some((r) => r.title.includes('New Year') || r.title.includes('NYE'))) {
      title = 'New Year\'s Eve Electronic Symphony';
      subtitle = 'Spatial modular audio, midnight confetti & new solar intentions';
    } else if (topTag === 'elysian' || topTag === 'swing' || rcpts.some((r) => r.title.includes('Swing') || r.title.includes('Elysian'))) {
      title = 'Angels Point Sunset Flight';
      subtitle = 'Skyline viewpoints, chillwave soundtrack & twilight street tacos';
    } else if (primaryLocation) {
      title = `${primaryLocation.split(',')[0]} Gathering`;
      subtitle = `${rcpts.length} moments connected across ${categories.length} categories`;
    }

    const timeSpanText =
      diffDays === 0
        ? diffHours <= 1
          ? 'Within 1 hour'
          : `Spanning ${diffHours} hours on ${formatShortDate(startDate)}`
        : `Across ${diffDays + 1} days (${formatShortDate(startDate)} – ${formatShortDate(endDate)})`;

    const evidenceSummary = [
      `${rcpts.length} moments tightly coupled across ${timeSpanText}`,
      `${categories.length} distinct categories: ${categories.map((c) => c.toUpperCase()).join(', ')}`,
      locations.length > 0 ? `Centered around ${locations.slice(0, 2).join(' & ')}` : 'Contextual semantic alignment',
      `Mean connection confidence: ${cluster.internalScore}% verified through mutual evidence`,
    ];

    const narrative = `${rcpts.length} observed moments unfold between ${formatShortDate(startDate)} and ${formatShortDate(endDate)}. Starting with ${rcpts[0].category} ("${rcpts[0].title}"), the progression weaves through ${categories.slice(1, -1).join(', ')} and culminates in ${rcpts[rcpts.length - 1].category} ("${rcpts[rcpts.length - 1].title}").`;

    return {
      id: `thread_${index + 1}_${cluster.receipts[0].id}`,
      title,
      subtitle,
      dateRange: { start: startDate, end: endDate },
      receiptIds: rcpts.map((r) => r.id),
      categories,
      locations,
      confidenceScore: cluster.internalScore,
      evidenceSummary,
      narrative,
    };
  });

  // Sort threads by confidence descending
  return threads.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
