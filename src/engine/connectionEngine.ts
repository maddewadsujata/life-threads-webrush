import type { Receipt, Connection, ConnectionEvidence } from '../types';
import { differenceInMinutes, isSameDay } from 'date-fns';
import { parseReceiptDate } from '../utils/dateUtils';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under', 'above',
  'that', 'this', 'these', 'those', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'just', 'more', 'some', 'out', 'all',
  'search', 'visited', 'listened', 'photo', 'purchase', 'note', 'message', 'watched',
]);

function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  return new Set(words);
}

function cleanLocation(loc?: string): string {
  if (!loc) return '';
  return loc.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

export function calculateConnection(r1: Receipt, r2: Receipt): Connection | null {
  if (r1.id === r2.id) return null;

  const d1 = parseReceiptDate(r1.timestamp);
  const d2 = parseReceiptDate(r2.timestamp);
  const diffMinutes = Math.abs(differenceInMinutes(d1, d2));
  const sameDay = isSameDay(d1, d2);

  const evidence: ConnectionEvidence[] = [];
  let score = 0;

  // 1. Same or very close location
  const loc1 = cleanLocation(r1.location);
  const loc2 = cleanLocation(r2.location);

  if (loc1 && loc2) {
    if (loc1 === loc2) {
      evidence.push({
        rule: 'same_location',
        description: `Exact same location: "${r1.location}"`,
        score: 30,
      });
      score += 30;
    } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
      evidence.push({
        rule: 'same_location',
        description: `Shared location cluster (${r1.location})`,
        score: 20,
      });
      score += 20;
    }
  }

  // 2. Proximity in time
  if (diffMinutes <= 30) {
    evidence.push({
      rule: 'close_time',
      description: `Within 30 minutes (${diffMinutes} min apart)`,
      score: 30,
    });
    score += 30;
  } else if (diffMinutes <= 120) {
    evidence.push({
      rule: 'close_time',
      description: `Within 2 hours (${Math.round(diffMinutes / 60 * 10) / 10} hrs apart)`,
      score: 20,
    });
    score += 20;
  } else if (diffMinutes <= 360) {
    evidence.push({
      rule: 'close_time',
      description: `Within the same 6-hour period (${Math.round(diffMinutes / 60)} hrs apart)`,
      score: 10,
    });
    score += 10;
  }

  // 3. Same calendar date
  if (sameDay && diffMinutes > 30) {
    evidence.push({
      rule: 'same_date',
      description: 'Occurred on the exact same date',
      score: 20,
    });
    score += 20;
  } else if (Math.abs(diffMinutes) <= 1440 && !sameDay) {
    evidence.push({
      rule: 'same_date',
      description: 'Occurred within consecutive 24 hours',
      score: 10,
    });
    score += 10;
  }

  // 4. Shared Tags
  const tags1 = new Set((r1.tags || []).map((t) => t.toLowerCase()));
  const tags2 = new Set((r2.tags || []).map((t) => t.toLowerCase()));
  const sharedTags: string[] = [];
  tags1.forEach((t) => {
    if (tags2.has(t)) sharedTags.push(t);
  });

  if (sharedTags.length > 0) {
    const pts = Math.min(25, sharedTags.length * 10);
    evidence.push({
      rule: 'shared_tag',
      description: `Shared tag${sharedTags.length > 1 ? 's' : ''}: [${sharedTags.slice(0, 3).join(', ')}]`,
      score: pts,
    });
    score += pts;
  }

  // 5. Shared semantic keywords in title & description
  const kw1 = extractKeywords(`${r1.title} ${r1.description}`);
  const kw2 = extractKeywords(`${r2.title} ${r2.description}`);
  const sharedKeywords: string[] = [];
  kw1.forEach((w) => {
    if (kw2.has(w)) sharedKeywords.push(w);
  });

  if (sharedKeywords.length > 0) {
    const pts = Math.min(20, sharedKeywords.length * 8);
    evidence.push({
      rule: 'shared_keyword',
      description: `Shared keyword${sharedKeywords.length > 1 ? 's' : ''}: "${sharedKeywords.slice(0, 3).join('", "')}"`,
      score: pts,
    });
    score += pts;
  }

  // 6. Category Complementarity (natural lifestyle sequence)
  const isComplementary =
    (r1.category === 'music' && (r2.category === 'places' || r2.category === 'events')) ||
    (r1.category === 'places' && (r2.category === 'photos' || r2.category === 'purchases')) ||
    (r1.category === 'movies' && (r2.category === 'purchases' || r2.category === 'notes')) ||
    (r1.category === 'searches' && (r2.category === 'places' || r2.category === 'purchases')) ||
    (r1.category === 'events' && (r2.category === 'purchases' || r2.category === 'photos'));

  if (isComplementary && (sameDay || diffMinutes <= 240)) {
    evidence.push({
      rule: 'complementary_category',
      description: `Complementary activity sequence (${r1.category} ↔ ${r2.category})`,
      score: 15,
    });
    score += 15;
  }

  // Normalize score to maximum 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // If score is under threshold, consider not significantly connected
  if (normalizedScore < 25 || evidence.length === 0) {
    return null;
  }

  // Determine primary human-readable reason
  const topEvidence = [...evidence].sort((a, b) => b.score - a.score)[0];
  const primaryReason = topEvidence ? topEvidence.description : 'Temporal and contextual overlap';

  return {
    sourceId: r1.id,
    targetId: r2.id,
    score: normalizedScore,
    evidence,
    primaryReason,
  };
}

export function buildConnectionNetwork(
  receipts: Receipt[],
  minScoreThreshold = 30
): {
  connections: Connection[];
  adjacencyMap: Map<string, Connection[]>;
} {
  const connections: Connection[] = [];
  const adjacencyMap = new Map<string, Connection[]>();

  receipts.forEach((r) => adjacencyMap.set(r.id, []));

  // Compute upper triangle
  for (let i = 0; i < receipts.length; i++) {
    for (let j = i + 1; j < receipts.length; j++) {
      const conn = calculateConnection(receipts[i], receipts[j]);
      if (conn && conn.score >= minScoreThreshold) {
        connections.push(conn);
        adjacencyMap.get(receipts[i].id)?.push(conn);
        // Add reciprocal entry for easy lookup
        adjacencyMap.get(receipts[j].id)?.push({
          sourceId: receipts[j].id,
          targetId: receipts[i].id,
          score: conn.score,
          evidence: conn.evidence,
          primaryReason: conn.primaryReason,
        });
      }
    }
  }

  // Sort connections by score descending for each receipt
  adjacencyMap.forEach((conns) => {
    conns.sort((a, b) => b.score - a.score);
  });

  return { connections, adjacencyMap };
}
