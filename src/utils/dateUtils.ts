import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
  isToday,
  isYesterday,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from 'date-fns';

export function parseReceiptDate(dateString: string): Date {
  const parsed = parseISO(dateString);
  if (isValid(parsed)) return parsed;
  const standardDate = new Date(dateString);
  if (isValid(standardDate)) return standardDate;
  return new Date();
}

export function formatReceiptDate(dateString: string): string {
  const d = parseReceiptDate(dateString);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy · h:mm a');
}

export function formatShortDate(dateString: string): string {
  const d = parseReceiptDate(dateString);
  return format(d, 'MMM d, yyyy');
}

export function formatTimeOnly(dateString: string): string {
  const d = parseReceiptDate(dateString);
  return format(d, 'h:mm a');
}

export function formatRelativeTime(dateString: string): string {
  const d = parseReceiptDate(dateString);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDayKey(dateString: string): string {
  const d = parseReceiptDate(dateString);
  return format(d, 'yyyy-MM-dd');
}

export function getHourOfDay(dateString: string): number {
  const d = parseReceiptDate(dateString);
  return d.getHours();
}

export function getDayOfWeekName(dateString: string): string {
  const d = parseReceiptDate(dateString);
  return format(d, 'EEEE');
}

export function timeDifferenceFormatted(date1: string, date2: string): string {
  const d1 = parseReceiptDate(date1);
  const d2 = parseReceiptDate(date2);
  const diffMin = Math.abs(differenceInMinutes(d1, d2));

  if (diffMin < 60) {
    return `${diffMin} min apart`;
  }
  const diffHours = Math.abs(differenceInHours(d1, d2));
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} apart`;
  }
  const diffDays = Math.abs(differenceInDays(d1, d2));
  return `${diffDays} day${diffDays > 1 ? 's' : ''} apart`;
}
