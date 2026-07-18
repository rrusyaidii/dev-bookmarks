import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { suggestTags } from '@/lib/ai-tagger';
import { fetchPageMetadata } from '@/lib/fetch-metadata';
import { tryNormalizeUrl } from '@/lib/url';
import {
  serializeBookmark,
  sortBookmarks,
  type SortKey,
} from '@/lib/serialize-bookmark';
import { corsOptionsResponse, withCors } from '@/lib/cors';
import { getAuthUser, unauthorizedJson } from '@/lib/auth';

const SORT_KEYS: SortKey[] = ['newest', 'oldest', 'az', 'tagCount', 'favorites'];

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    const sortParam = searchParams.get('sort') as SortKey | null;
    const sort: SortKey =
      sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'newest';

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    let filtered = bookmarks.map(serializeBookmark);

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.notes.toLowerCase().includes(query) ||
          b.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (tag) {
      filtered = filtered.filter((b) =>
        b.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    filtered = sortBookmarks(filtered, sort);

    return withCors(NextResponse.json(filtered, { status: 200 }), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch bookmarks';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const body = await request.json();
    const { favicon: bodyFavicon } = body as {
      url?: string;
      title?: string;
      description?: string;
      favicon?: string;
      tags?: string[];
      notes?: string;
      isFavorite?: boolean;
    };

    if (!body.url || typeof body.url !== 'string') {
      return withCors(
        NextResponse.json({ error: 'URL is required' }, { status: 400 }),
        origin
      );
    }

    const normalized = tryNormalizeUrl(body.url);
    if (!normalized) {
      return withCors(
        NextResponse.json({ error: 'Invalid URL' }, { status: 400 }),
        origin
      );
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_url: { userId: user.id, url: normalized } },
    });
    if (existing) {
      return withCors(
        NextResponse.json(
          { error: 'Bookmark with this URL already exists', id: existing.id },
          { status: 409 }
        ),
        origin
      );
    }

    let title = typeof body.title === 'string' ? body.title.trim() : '';
    let description =
      typeof body.description === 'string' ? body.description.trim() : '';
    let favicon = typeof bodyFavicon === 'string' ? bodyFavicon.trim() : '';
    const rawTags: unknown[] = Array.isArray(body.tags) ? body.tags : [];
    let tags = rawTags.filter(
      (t): t is string => typeof t === 'string' && t.trim().length > 0
    );
    const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
    const isFavorite = Boolean(body.isFavorite);

    if (!title || !description || !favicon) {
      const meta = await fetchPageMetadata(normalized);
      if (!title) title = meta.title;
      if (!description) description = meta.description;
      if (!favicon) favicon = meta.favicon;
    }

    if (!title) {
      return withCors(
        NextResponse.json(
          { error: 'Could not determine a title for this URL' },
          { status: 400 }
        ),
        origin
      );
    }

    if (tags.length === 0) {
      tags = await suggestTags(title, description, normalized);
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        url: normalized,
        title,
        description: description ?? '',
        favicon:
          favicon ||
          `https://www.google.com/s2/favicons?domain=${new URL(normalized).hostname}&sz=64`,
        tags: JSON.stringify(tags),
        notes,
        isFavorite,
      },
    });

    return withCors(
      NextResponse.json(serializeBookmark(bookmark), { status: 201 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create bookmark';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
