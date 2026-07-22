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
    const folder = searchParams.get('folder');
    const sortParam = searchParams.get('sort') as SortKey | null;
    const sort: SortKey =
      sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;

    const where: any = {
      userId: user.id,
      ...(folder === 'unfiled'
        ? { folders: { none: {} } }
        : folder
          ? { folders: { some: { id: folder } } }
          : {}),
    };

    if (tag) {
      where.tags = {
        contains: tag,
      };
    }

    if (q) {
      const query = q.toLowerCase();
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { url: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
        { tags: { contains: query } },
      ];
    }

    const orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      case 'az':
        orderBy.title = 'asc';
        break;
      case 'tagCount':
        orderBy.tags = 'desc';
        break;
      case 'favorites':
        orderBy.isFavorite = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        include: { folders: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.bookmark.count({ where }),
    ]);

    const serialized = bookmarks.map(serializeBookmark);

    const response = NextResponse.json({
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    response.headers.set('Cache-Control', 'private, max-age=30');
    return withCors(response, origin);
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
      folders?: string[];
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
    const rawFolders: unknown[] = Array.isArray(body.folders) ? body.folders : [];
    const folderNames = [
      ...new Set(
        rawFolders.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
          .map((f) => f.trim())
      ),
    ];

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
        folders: {
          connectOrCreate: folderNames.map((name) => ({
            where: { userId_name: { userId: user.id, name } },
            create: { userId: user.id, name },
          })),
        },
      },
      include: { folders: true },
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
