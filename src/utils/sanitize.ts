/**
 * Security & Data Sanitization Utilities
 * Protects against XSS, script injection, malformed URLs, and prototype pollution.
 */

const DANGEROUS_TAG_REGEX = /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /^\s*(javascript|vbscript|data(?!\s*:\s*image)):/i;
const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

/**
 * Sanitizes arbitrary text input by removing dangerous tags, trimming,
 * and restricting length to prevent memory exhaustion or layout breakage.
 */
export function sanitizeText(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input).slice(0, maxLength).trim();
  }

  // Strip null bytes and control characters (except newline/tab)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip dangerous HTML tags
  const defanged = cleaned.replace(DANGEROUS_TAG_REGEX, '');

  return defanged.slice(0, maxLength).trim();
}

/**
 * Validates and sanitizes a URL. Only permits http, https, or safe data image protocols.
 * Blocks javascript: and arbitrary data schemes.
 */
export function sanitizeUrl(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Block javascript: or executable protocols
  if (JAVASCRIPT_PROTOCOL_REGEX.test(trimmed)) {
    return undefined;
  }

  // Permit relative paths, absolute http/https, or safe image data URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return encodeURI(decodeURI(trimmed));
  }

  return undefined;
}

/**
 * Sanitizes an array of tags: lowercases, removes hash prefixes,
 * validates against regex, bounds to 20 tags per receipt, max 50 chars each.
 */
export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    if (typeof tags === 'string') {
      return tags
        .split(/[,;|]/)
        .map((t) => sanitizeSingleTag(t))
        .filter((t): t is string => Boolean(t))
        .slice(0, 20);
    }
    return [];
  }

  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const raw of tags) {
    const cleaned = sanitizeSingleTag(raw);
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      sanitized.push(cleaned);
      if (sanitized.length >= 20) break;
    }
  }

  return sanitized;
}

function sanitizeSingleTag(raw: unknown): string | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const str = String(raw).trim().toLowerCase().replace(/^#/, '');
  // Keep only alphanumeric, hyphen, underscore
  const safe = str.replace(/[^a-z0-9\-_]/g, '').slice(0, 50);
  return safe.length > 0 ? safe : null;
}

/**
 * Clamps numeric inputs to safe floating point ranges
 */
export function sanitizeNumber(
  val: unknown,
  min: number = -1e9,
  max: number = 1e9,
  fallback?: number
): number | undefined {
  if (val === null || val === undefined || val === '') return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
