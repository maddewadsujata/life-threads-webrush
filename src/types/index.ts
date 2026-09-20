export type ReceiptCategory =
  | 'music'
  | 'movies'
  | 'places'
  | 'purchases'
  | 'photos'
  | 'messages'
  | 'searches'
  | 'events'
  | 'notes';

export interface ReceiptMetadata {
  artist?: string;
  album?: string;
  durationSeconds?: number;
  genre?: string;
  director?: string;
  platform?: string;
  rating?: number;
  price?: number;
  currency?: string;
  merchant?: string;
  items?: string[];
  camera?: string;
  resolution?: string;
  photoUrl?: string;
  sender?: string;
  recipient?: string;
  query?: string;
  resultsCount?: number;
  venue?: string;
  attendeesCount?: number;
  mood?: string;
  wordCount?: number;
  sentiment?: 'positive' | 'neutral' | 'reflective' | 'energized' | 'nostalgic';
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface Receipt {
  id: string;
  category: ReceiptCategory;
  title: string;
  timestamp: string; // ISO 8601
  location?: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  tags: string[];
  metadata?: ReceiptMetadata;
  threadIds?: string[];
}

export interface ConnectionEvidence {
  rule: 'same_location' | 'close_time' | 'same_date' | 'shared_keyword' | 'shared_tag' | 'event_window' | 'complementary_category';
  description: string;
  score: number;
}

export interface Connection {
  sourceId: string;
  targetId: string;
  score: number; // 0 to 100
  evidence: ConnectionEvidence[];
  primaryReason: string;
}

export interface Thread {
  id: string;
  title: string;
  subtitle: string;
  dateRange: { start: string; end: string };
  receiptIds: string[];
  categories: ReceiptCategory[];
  locations: string[];
  confidenceScore: number; // 0 - 100
  evidenceSummary: string[];
  narrative: string;
  themeColor?: string;
}

export interface StoryChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  narrative: string;
  dateRange: { start: string; end: string };
  locations: string[];
  categories: ReceiptCategory[];
  receipts: Receipt[];
  threadId?: string;
  keyInsights: string[];
}

export interface DynamicInsight {
  id: string;
  type: 'busiest_day' | 'repeated_place' | 'active_hour' | 'growing_category' | 'strongest_connection' | 'most_connected_receipt' | 'activity_streak' | 'diverse_day';
  title: string;
  headline: string;
  description: string;
  metricValue: string | number;
  evidence: string;
  category?: ReceiptCategory;
  receiptIds?: string[];
}

export interface FilterState {
  searchQuery: string;
  categories: ReceiptCategory[];
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  location: string;
  sortBy: 'newest' | 'oldest' | 'relevance' | 'density' | 'connections';
  viewMode: 'grid' | 'list';
}

export interface DatasetStats {
  totalReceipts: number;
  activeDays: number;
  totalLocations: number;
  connectionsDiscovered: number;
  threadsCount: number;
  chaptersCount: number;
  mostActiveCategory: ReceiptCategory;
  dateRange: { start: string; end: string };
}
