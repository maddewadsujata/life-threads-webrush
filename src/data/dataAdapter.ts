import type { Receipt, ReceiptCategory, ReceiptMetadata } from '../types';
import { sanitizeText, sanitizeUrl, sanitizeTags, sanitizeNumber } from '../utils/sanitize';

export interface ParseResult {
  receipts: Receipt[];
  errors: string[];
  totalRows: number;
  categoriesFound: ReceiptCategory[];
}

const MAX_IMPORT_ROWS = 2500;

const CATEGORY_SYNONYMS: Record<string, ReceiptCategory> = {
  music: 'music',
  song: 'music',
  track: 'music',
  audio: 'music',
  listening: 'music',
  spotify: 'music',

  movie: 'movies',
  movies: 'movies',
  film: 'movies',
  cinema: 'movies',
  tv: 'movies',
  show: 'movies',
  entertainment: 'movies',

  place: 'places',
  places: 'places',
  location: 'places',
  checkin: 'places',
  venue: 'places',
  travel: 'places',
  geo: 'places',

  purchase: 'purchases',
  purchases: 'purchases',
  transaction: 'purchases',
  order: 'purchases',
  payment: 'purchases',
  shopping: 'purchases',
  bought: 'purchases',

  photo: 'photos',
  photos: 'photos',
  picture: 'photos',
  image: 'photos',
  camera: 'photos',
  snapshot: 'photos',

  message: 'messages',
  messages: 'messages',
  chat: 'messages',
  text: 'messages',
  sms: 'messages',
  conversation: 'messages',

  search: 'searches',
  searches: 'searches',
  query: 'searches',
  google: 'searches',
  lookup: 'searches',

  event: 'events',
  events: 'events',
  calendar: 'events',
  meetup: 'events',
  concert: 'events',
  festival: 'events',

  note: 'notes',
  notes: 'notes',
  memo: 'notes',
  journal: 'notes',
  writing: 'notes',
  thought: 'notes',
};

export function normalizeCategory(raw: string | undefined): ReceiptCategory {
  if (!raw) return 'notes';
  const clean = raw.toLowerCase().trim();
  return CATEGORY_SYNONYMS[clean] || 'notes';
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function parseCSV(csvContent: string): ParseResult {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      receipts: [],
      errors: ['File is empty or missing a header row.'],
      totalRows: 0,
      categoriesFound: [],
    };
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const getIndex = (keys: string[]): number =>
    headers.findIndex((h) => keys.some((k) => h === k || h.includes(k)));

  const titleIdx = getIndex(['title', 'name', 'summary', 'track', 'subject', 'item']);
  const catIdx = getIndex(['category', 'type', 'kind', 'eventtype']);
  const timeIdx = getIndex(['timestamp', 'date', 'time', 'datetime', 'createdat']);
  const descIdx = getIndex(['description', 'desc', 'details', 'text', 'notes', 'body', 'content']);
  const locIdx = getIndex(['location', 'place', 'address', 'city', 'venue']);
  const tagsIdx = getIndex(['tags', 'tag', 'keywords', 'labels', 'categories']);
  const latIdx = getIndex(['lat', 'latitude']);
  const lngIdx = getIndex(['lng', 'lon', 'longitude']);
  const priceIdx = getIndex(['price', 'amount', 'cost', 'total']);

  const receipts: Receipt[] = [];
  const errors: string[] = [];
  const categoriesSet = new Set<ReceiptCategory>();
  const totalRows = Math.min(lines.length - 1, MAX_IMPORT_ROWS);

  for (let i = 1; i <= totalRows; i++) {
    try {
      const row = parseCSVLine(lines[i]);
      if (row.length === 0 || row.every((c) => !c)) continue;

      const rawCategory = catIdx >= 0 ? row[catIdx] : 'notes';
      const category = normalizeCategory(rawCategory);
      categoriesSet.add(category);

      const rawTitle = titleIdx >= 0 && row[titleIdx] ? row[titleIdx] : `Moment #${i}`;
      const title = sanitizeText(rawTitle, 200) || `Moment #${i}`;

      const rawDate = timeIdx >= 0 && row[timeIdx] ? row[timeIdx] : new Date().toISOString();
      const date = new Date(rawDate);
      const timestamp = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();

      const rawDesc = descIdx >= 0 && row[descIdx] ? row[descIdx] : title;
      const description = sanitizeText(rawDesc, 1000) || title;

      const rawLoc = locIdx >= 0 && row[locIdx] ? row[locIdx] : undefined;
      const location = rawLoc ? sanitizeText(rawLoc, 120) : undefined;

      const rawTags = tagsIdx >= 0 && row[tagsIdx] ? row[tagsIdx] : '';
      const tags = sanitizeTags(rawTags.length > 0 ? rawTags : [category]);

      let coordinates: { lat: number; lng: number } | undefined = undefined;
      if (latIdx >= 0 && lngIdx >= 0 && row[latIdx] && row[lngIdx]) {
        const lat = sanitizeNumber(row[latIdx], -90, 90);
        const lng = sanitizeNumber(row[lngIdx], -180, 180);
        if (lat !== undefined && lng !== undefined) {
          coordinates = { lat, lng };
        }
      }

      const rawPrice = priceIdx >= 0 && row[priceIdx] ? row[priceIdx] : undefined;
      const price = sanitizeNumber(rawPrice, 0, 1e7);

      receipts.push({
        id: `csv_rcpt_${i}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        category,
        title,
        timestamp,
        location: location || undefined,
        coordinates,
        description,
        tags: tags.length > 0 ? tags : [category],
        metadata: price !== undefined ? { price, currency: 'USD' } : undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${i + 1}: ${msg}`);
    }
  }

  return {
    receipts,
    errors,
    totalRows,
    categoriesFound: Array.from(categoriesSet),
  };
}

export function parseJSON(jsonContent: string): ParseResult {
  const receipts: Receipt[] = [];
  const errors: string[] = [];
  const categoriesSet = new Set<ReceiptCategory>();

  try {
    const parsed = JSON.parse(jsonContent);
    const records = Array.isArray(parsed) ? parsed : parsed.receipts || parsed.data || parsed.moments;

    if (!Array.isArray(records)) {
      return {
        receipts: [],
        errors: ['Invalid JSON: Expected an array of records or an object with "receipts" / "data" array.'],
        totalRows: 0,
        categoriesFound: [],
      };
    }

    const cappedRecords = records.slice(0, MAX_IMPORT_ROWS);

    cappedRecords.forEach((item: unknown, idx: number) => {
      try {
        if (!item || typeof item !== 'object') return;
        const rec = item as Record<string, unknown>;

        const rawCat = typeof rec.category === 'string' ? rec.category : typeof rec.type === 'string' ? rec.type : typeof rec.kind === 'string' ? rec.kind : undefined;
        const category = normalizeCategory(rawCat);
        categoriesSet.add(category);

        const rawTitle = typeof rec.title === 'string' ? rec.title : typeof rec.name === 'string' ? rec.name : typeof rec.subject === 'string' ? rec.subject : `Moment #${idx + 1}`;
        const title = sanitizeText(rawTitle, 200) || `Moment #${idx + 1}`;

        const rawDate = rec.timestamp || rec.date || rec.time || rec.datetime || rec.createdAt;
        const d = rawDate ? new Date(String(rawDate)) : new Date();
        const timestamp = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();

        const rawDesc = rec.description || rec.details || rec.notes || rec.summary || rec.text || title;
        const description = sanitizeText(rawDesc, 1000) || title;

        const rawLoc = rec.location || rec.place || rec.venue || rec.address;
        const location = rawLoc ? sanitizeText(rawLoc, 120) : undefined;

        const tags = sanitizeTags(rec.tags || [category]);

        let coordinates: { lat: number; lng: number } | undefined = undefined;
        if (rec.coordinates && typeof rec.coordinates === 'object') {
          const c = rec.coordinates as Record<string, unknown>;
          const lat = sanitizeNumber(c.lat, -90, 90);
          const lng = sanitizeNumber(c.lng, -180, 180);
          if (lat !== undefined && lng !== undefined) {
            coordinates = { lat, lng };
          }
        } else if (rec.lat !== undefined && rec.lng !== undefined) {
          const lat = sanitizeNumber(rec.lat, -90, 90);
          const lng = sanitizeNumber(rec.lng, -180, 180);
          if (lat !== undefined && lng !== undefined) {
            coordinates = { lat, lng };
          }
        }

        // Clean metadata if present
        let metadata: ReceiptMetadata | undefined = undefined;
        if (rec.metadata && typeof rec.metadata === 'object') {
          const rawMeta = rec.metadata as Record<string, unknown>;
          metadata = {};
          if (typeof rawMeta.artist === 'string') metadata.artist = sanitizeText(rawMeta.artist, 100);
          if (typeof rawMeta.album === 'string') metadata.album = sanitizeText(rawMeta.album, 100);
          if (typeof rawMeta.director === 'string') metadata.director = sanitizeText(rawMeta.director, 100);
          if (typeof rawMeta.merchant === 'string') metadata.merchant = sanitizeText(rawMeta.merchant, 100);
          if (typeof rawMeta.camera === 'string') metadata.camera = sanitizeText(rawMeta.camera, 100);
          if (typeof rawMeta.query === 'string') metadata.query = sanitizeText(rawMeta.query, 200);
          if (typeof rawMeta.recipient === 'string') metadata.recipient = sanitizeText(rawMeta.recipient, 100);
          if (typeof rawMeta.mood === 'string') metadata.mood = sanitizeText(rawMeta.mood, 50);
          if (rawMeta.price !== undefined) metadata.price = sanitizeNumber(rawMeta.price, 0, 1e7);
          if (rawMeta.photoUrl) metadata.photoUrl = sanitizeUrl(rawMeta.photoUrl);
        } else if (rec.price !== undefined) {
          metadata = { price: sanitizeNumber(rec.price, 0, 1e7) };
        }

        receipts.push({
          id: typeof rec.id === 'string' && rec.id.trim() ? sanitizeText(rec.id, 64) : `json_rcpt_${idx}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          category,
          title,
          timestamp,
          location: location || undefined,
          coordinates,
          description,
          tags: tags.length > 0 ? tags : [category],
          metadata,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Record ${idx + 1}: ${msg}`);
      }
    });

    return {
      receipts,
      errors,
      totalRows: cappedRecords.length,
      categoriesFound: Array.from(categoriesSet),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      receipts: [],
      errors: [`JSON parse error: ${msg}`],
      totalRows: 0,
      categoriesFound: [],
    };
  }
}
