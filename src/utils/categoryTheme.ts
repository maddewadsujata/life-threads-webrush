import {
  Music,
  Film,
  MapPin,
  ShoppingBag,
  Camera,
  MessageSquare,
  Search,
  Calendar,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { ReceiptCategory } from '../types';

export interface CategoryThemeInfo {
  name: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
  description: string;
}

export const CATEGORY_THEMES: Record<ReceiptCategory, CategoryThemeInfo> = {
  music: {
    name: 'Music',
    icon: Music,
    color: '#10b981', // emerald
    textColor: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    gradient: 'from-emerald-500/20 to-teal-500/5',
    description: 'Tracks, albums, listening sessions & artists',
  },
  movies: {
    name: 'Movies & TV',
    icon: Film,
    color: '#a855f7', // purple
    textColor: 'text-purple-400',
    bgLight: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    gradient: 'from-purple-500/20 to-indigo-500/5',
    description: 'Films, screenings, shows & entertainment',
  },
  places: {
    name: 'Places',
    icon: MapPin,
    color: '#f43f5e', // rose
    textColor: 'text-rose-400',
    bgLight: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    gradient: 'from-rose-500/20 to-amber-500/5',
    description: 'Locations, venues, neighborhoods & check-ins',
  },
  purchases: {
    name: 'Purchases',
    icon: ShoppingBag,
    color: '#14b8a6', // teal
    textColor: 'text-teal-400',
    bgLight: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    gradient: 'from-teal-500/20 to-emerald-500/5',
    description: 'Receipts, tickets, cafes & transactions',
  },
  photos: {
    name: 'Photos',
    icon: Camera,
    color: '#06b6d4', // cyan
    textColor: 'text-cyan-400',
    bgLight: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    gradient: 'from-cyan-500/20 to-blue-500/5',
    description: 'Captured frames, memories & visual tokens',
  },
  messages: {
    name: 'Messages',
    icon: MessageSquare,
    color: '#3b82f6', // blue
    textColor: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    gradient: 'from-blue-500/20 to-sky-500/5',
    description: 'Conversations, sent notes & saved quotes',
  },
  searches: {
    name: 'Searches',
    icon: Search,
    color: '#eab308', // yellow
    textColor: 'text-yellow-400',
    bgLight: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    gradient: 'from-yellow-500/20 to-amber-500/5',
    description: 'Curiosities, queries & late-night rabbit holes',
  },
  events: {
    name: 'Events',
    icon: Calendar,
    color: '#ec4899', // pink
    textColor: 'text-pink-400',
    bgLight: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    gradient: 'from-pink-500/20 to-fuchsia-500/5',
    description: 'Concerts, festivals, meetups & gatherings',
  },
  notes: {
    name: 'Personal Notes',
    icon: FileText,
    color: '#f97316', // orange
    textColor: 'text-orange-400',
    bgLight: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    glowColor: 'rgba(249, 115, 22, 0.25)',
    gradient: 'from-orange-500/20 to-rose-500/5',
    description: 'Reflections, ideas, journals & thoughts',
  },
};

export const ALL_CATEGORIES: ReceiptCategory[] = [
  'music',
  'movies',
  'places',
  'purchases',
  'photos',
  'messages',
  'searches',
  'events',
  'notes',
];
