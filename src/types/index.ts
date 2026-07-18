export type LinkStatus = 'unknown' | 'ok' | 'broken' | 'redirect';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  tags: string[];
  notes: string;
  isFavorite: boolean;
  linkStatus: LinkStatus;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Tag {
  name: string;
  count: number;
  color?: string;
}

export interface Stats {
  total: number;
  savedThisWeek: number;
  mostUsedTag: string;
  favorites?: number;
}

export type SortKey = 'newest' | 'oldest' | 'az' | 'tagCount' | 'favorites';
