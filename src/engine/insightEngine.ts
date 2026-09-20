import type {
  Receipt,
  Connection,
  Thread,
  DynamicInsight,
  DatasetStats,
  ReceiptCategory,
} from '../types';
import {
  parseReceiptDate,
  formatShortDate,
  formatDayKey,
  getHourOfDay,
  getDayOfWeekName,
} from '../utils/dateUtils';
import { ALL_CATEGORIES } from '../utils/categoryTheme';

export interface CategoryCorrelation {
  pair: string;
  cat1: ReceiptCategory;
  cat2: ReceiptCategory;
  count: number;
}

export interface LocationStat {
  name: string;
  count: number;
  categories: ReceiptCategory[];
  lastVisited: string;
}

export interface HourDistribution {
  hour: number;
  label: string;
  count: number;
  isLateNight: boolean;
  isPeak: boolean;
}

export interface DayOfWeekStat {
  dayName: string;
  shortName: string;
  count: number;
  percentage: number;
}

export function computeDatasetStats(
  receipts: Receipt[],
  connections: Connection[],
  threads: Thread[]
): DatasetStats {
  if (receipts.length === 0) {
    return {
      totalReceipts: 0,
      activeDays: 0,
      totalLocations: 0,
      connectionsDiscovered: 0,
      threadsCount: 0,
      chaptersCount: 0,
      mostActiveCategory: 'notes',
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
    };
  }

  const daysSet = new Set<string>();
  const locationsSet = new Set<string>();
  const categoryCounts = new Map<ReceiptCategory, number>();

  let earliest = receipts[0].timestamp;
  let latest = receipts[0].timestamp;

  receipts.forEach((r) => {
    daysSet.add(formatDayKey(r.timestamp));
    if (r.location) locationsSet.add(r.location);
    categoryCounts.set(r.category, (categoryCounts.get(r.category) || 0) + 1);

    if (new Date(r.timestamp) < new Date(earliest)) earliest = r.timestamp;
    if (new Date(r.timestamp) > new Date(latest)) latest = r.timestamp;
  });

  let topCategory: ReceiptCategory = 'notes';
  let maxCatCount = 0;
  categoryCounts.forEach((count, cat) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  });

  return {
    totalReceipts: receipts.length,
    activeDays: daysSet.size,
    totalLocations: locationsSet.size,
    connectionsDiscovered: connections.length,
    threadsCount: threads.length,
    chaptersCount: threads.length,
    mostActiveCategory: topCategory,
    dateRange: { start: earliest, end: latest },
  };
}

export function computeCategoryDistribution(receipts: Receipt[]) {
  const counts = new Map<ReceiptCategory, number>();
  ALL_CATEGORIES.forEach((cat) => counts.set(cat, 0));

  receipts.forEach((r) => {
    counts.set(r.category, (counts.get(r.category) || 0) + 1);
  });

  const total = receipts.length || 1;
  return ALL_CATEGORIES.map((cat) => {
    const count = counts.get(cat) || 0;
    return {
      category: cat,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    };
  }).sort((a, b) => b.count - a.count);
}

export function computeHourlyDistribution(receipts: Receipt[]): HourDistribution[] {
  const hours = new Array(24).fill(0);
  receipts.forEach((r) => {
    const h = getHourOfDay(r.timestamp);
    hours[h]++;
  });

  const maxHourCount = Math.max(...hours, 1);

  return hours.map((count, hour) => {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const isLateNight = hour >= 23 || hour <= 4;
    const isPeak = count >= maxHourCount * 0.8 && count > 2;

    return {
      hour,
      label: `${hour12}${ampm}`,
      count,
      isLateNight,
      isPeak,
    };
  });
}

export function computeDayOfWeekStats(receipts: Receipt[]): DayOfWeekStat[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = new Array(7).fill(0);

  receipts.forEach((r) => {
    const dayIdx = parseReceiptDate(r.timestamp).getDay();
    counts[dayIdx]++;
  });

  const total = receipts.length || 1;
  return days.map((dayName, idx) => ({
    dayName,
    shortName: shortDays[idx],
    count: counts[idx],
    percentage: Math.round((counts[idx] / total) * 100),
  }));
}

export function computeTimelineDensity(receipts: Receipt[]) {
  const dayMap = new Map<string, { date: string; count: number; categories: Set<ReceiptCategory> }>();

  receipts.forEach((r) => {
    const dayKey = formatDayKey(r.timestamp);
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, { date: dayKey, count: 0, categories: new Set() });
    }
    const entry = dayMap.get(dayKey)!;
    entry.count++;
    entry.categories.add(r.category);
  });

  const sortedDays = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, data]) => ({
      date: key,
      formattedDate: formatShortDate(key),
      count: data.count,
      categoriesCount: data.categories.size,
      categories: Array.from(data.categories),
    }));

  return sortedDays;
}

export function computeTopLocations(receipts: Receipt[], limit = 8): LocationStat[] {
  const map = new Map<string, { count: number; categories: Set<ReceiptCategory>; lastVisited: string }>();

  receipts.forEach((r) => {
    if (!r.location) return;
    const loc = r.location.trim();
    if (!map.has(loc)) {
      map.set(loc, { count: 0, categories: new Set(), lastVisited: r.timestamp });
    }
    const entry = map.get(loc)!;
    entry.count++;
    entry.categories.add(r.category);
    if (new Date(r.timestamp) > new Date(entry.lastVisited)) {
      entry.lastVisited = r.timestamp;
    }
  });

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      categories: Array.from(data.categories),
      lastVisited: data.lastVisited,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function computeCategoryCorrelations(
  connections: Connection[],
  receiptMap: Map<string, Receipt>
): CategoryCorrelation[] {
  const pairs = new Map<string, { cat1: ReceiptCategory; cat2: ReceiptCategory; count: number }>();

  connections.forEach((conn) => {
    const r1 = receiptMap.get(conn.sourceId);
    const r2 = receiptMap.get(conn.targetId);
    if (!r1 || !r2 || r1.category === r2.category) return;

    const [cat1, cat2] = [r1.category, r2.category].sort() as [ReceiptCategory, ReceiptCategory];
    const key = `${cat1}::${cat2}`;

    if (!pairs.has(key)) {
      pairs.set(key, { cat1, cat2, count: 0 });
    }
    pairs.get(key)!.count++;
  });

  return Array.from(pairs.values())
    .map((item) => ({
      pair: `${item.cat1.toUpperCase()} ↔ ${item.cat2.toUpperCase()}`,
      cat1: item.cat1,
      cat2: item.cat2,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function generateDynamicInsights(
  receipts: Receipt[],
  connections: Connection[],
  threads: Thread[]
): DynamicInsight[] {
  if (receipts.length === 0) return [];

  const insights: DynamicInsight[] = [];
  const receiptMap = new Map<string, Receipt>();
  receipts.forEach((r) => receiptMap.set(r.id, r));

  // 1. Busiest Day
  const dayCounts = new Map<string, { count: number; receipts: Receipt[] }>();
  receipts.forEach((r) => {
    const d = formatDayKey(r.timestamp);
    if (!dayCounts.has(d)) dayCounts.set(d, { count: 0, receipts: [] });
    const entry = dayCounts.get(d)!;
    entry.count++;
    entry.receipts.push(r);
  });

  const sortedDays = Array.from(dayCounts.entries()).sort((a, b) => b[1].count - a[1].count);
  if (sortedDays.length > 0) {
    const [busiestDate, data] = sortedDays[0];
    const cats = Array.from(new Set(data.receipts.map((r) => r.category)));
    insights.push({
      id: 'ins_busiest_day',
      type: 'busiest_day',
      title: 'Busiest Observed Day',
      headline: `${data.count} moments logged on ${formatShortDate(busiestDate)}`,
      description: `Spanned ${cats.length} distinct categories with dense sequential activity.`,
      metricValue: `${data.count} receipts`,
      evidence: `Recorded highest timestamp concentration on ${formatShortDate(busiestDate)}.`,
      receiptIds: data.receipts.map((r) => r.id),
    });
  }

  // 2. Most Repeated Place
  const topLocations = computeTopLocations(receipts, 1);
  if (topLocations.length > 0 && topLocations[0].count > 1) {
    const topLoc = topLocations[0];
    insights.push({
      id: 'ins_repeated_place',
      type: 'repeated_place',
      title: 'Primary Spatial Anchor',
      headline: topLoc.name,
      description: `Appeared in ${topLoc.count} individual receipts across ${topLoc.categories.length} categories (${topLoc.categories.join(', ')}).`,
      metricValue: `${topLoc.count} visits`,
      evidence: `Exact location match repeated ${topLoc.count} times in the receipt metadata.`,
    });
  }

  // 3. Most Active Hour Block
  const hours = computeHourlyDistribution(receipts);
  const peakHour = [...hours].sort((a, b) => b.count - a.count)[0];
  if (peakHour && peakHour.count > 0) {
    insights.push({
      id: 'ins_active_hour',
      type: 'active_hour',
      title: 'Peak Activity Window',
      headline: `${peakHour.label} (${peakHour.hour}:00 - ${peakHour.hour + 1}:00)`,
      description: `${peakHour.count} receipts initiated during this 60-minute window${peakHour.isLateNight ? ' — prominent late-night digital presence' : ''}.`,
      metricValue: `${peakHour.count} moments`,
      evidence: `Local timestamp hour extraction shows mode at ${peakHour.label}.`,
    });
  }

  // 4. Strongest Connection
  if (connections.length > 0) {
    const topConn = [...connections].sort((a, b) => b.score - a.score)[0];
    const r1 = receiptMap.get(topConn.sourceId);
    const r2 = receiptMap.get(topConn.targetId);
    if (r1 && r2) {
      insights.push({
        id: 'ins_strongest_conn',
        type: 'strongest_connection',
        title: 'Strongest Discovered Link',
        headline: `${r1.category.toUpperCase()} ↔ ${r2.category.toUpperCase()}`,
        description: `"${r1.title}" and "${r2.title}" share ${topConn.score}% correlation confidence.`,
        metricValue: `${topConn.score}% match`,
        evidence: topConn.evidence.map((e) => e.description).join('; '),
        receiptIds: [r1.id, r2.id],
      });
    }
  }

  // 5. Most Connected Receipt (Hub Node)
  const connectionCounts = new Map<string, number>();
  connections.forEach((c) => {
    connectionCounts.set(c.sourceId, (connectionCounts.get(c.sourceId) || 0) + 1);
    connectionCounts.set(c.targetId, (connectionCounts.get(c.targetId) || 0) + 1);
  });

  const sortedHubs = Array.from(connectionCounts.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedHubs.length > 0 && sortedHubs[0][1] > 2) {
    const hubId = sortedHubs[0][0];
    const hubReceipt = receiptMap.get(hubId);
    if (hubReceipt) {
      insights.push({
        id: 'ins_hub_receipt',
        type: 'most_connected_receipt',
        title: 'Central Anchor Moment',
        headline: hubReceipt.title,
        description: `Directly bridges ${sortedHubs[0][1]} other life moments as an informational nexus.`,
        metricValue: `${sortedHubs[0][1]} links`,
        evidence: `Exhibits highest degree centrality in the relationship adjacency graph.`,
        category: hubReceipt.category,
        receiptIds: [hubReceipt.id],
      });
    }
  }

  // 6. Most Diverse Day
  let mostDiverseDay = '';
  let maxUniqueCats = 0;
  let diverseReceipts: Receipt[] = [];

  dayCounts.forEach((data, day) => {
    const unique = new Set(data.receipts.map((r) => r.category)).size;
    if (unique > maxUniqueCats) {
      maxUniqueCats = unique;
      mostDiverseDay = day;
      diverseReceipts = data.receipts;
    }
  });

  if (maxUniqueCats >= 3) {
    insights.push({
      id: 'ins_diverse_day',
      type: 'diverse_day',
      title: 'Most Diverse Activity Day',
      headline: formatShortDate(mostDiverseDay),
      description: `Covered ${maxUniqueCats} different categories within 24 hours.`,
      metricValue: `${maxUniqueCats} categories`,
      evidence: `Observed distinct records for: ${Array.from(new Set(diverseReceipts.map((r) => r.category))).join(', ')}.`,
      receiptIds: diverseReceipts.map((r) => r.id),
    });
  }

  return insights;
}
