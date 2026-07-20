import type { Bookmark as PrismaBookmark } from '@prisma/client';
import type { Bookmark } from '@/types';

type BookmarkWithFolders = PrismaBookmark & {
  folders?: { id: string; name: string }[];
};

export function serializeBookmark(bookmark: BookmarkWithFolders): Bookmark {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(bookmark.tags) as unknown;
    tags = Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === 'string')
      : [];
  } catch {
    tags = [];
  }

  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title,
    description: bookmark.description,
    favicon: bookmark.favicon,
    tags,
    folders: (bookmark.folders ?? []).map((f) => ({ id: f.id, name: f.name })),
    notes: bookmark.notes,
    isFavorite: bookmark.isFavorite,
    linkStatus: bookmark.linkStatus as Bookmark['linkStatus'],
    lastCheckedAt: bookmark.lastCheckedAt
      ? bookmark.lastCheckedAt.toISOString()
      : null,
    createdAt: bookmark.createdAt.toISOString(),
    updatedAt: bookmark.updatedAt.toISOString(),
  };
}

export type SortKey = 'newest' | 'oldest' | 'az' | 'tagCount' | 'favorites';

export function sortBookmarks(
  bookmarks: Bookmark[],
  sort: SortKey = 'newest'
): Bookmark[] {
  const copy = [...bookmarks];

  switch (sort) {
    case 'oldest':
      return copy.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'tagCount':
      return copy.sort((a, b) => b.tags.length - a.tags.length);
    case 'favorites':
      return copy.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    case 'newest':
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}
