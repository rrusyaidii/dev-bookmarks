import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBookmark } from '@/lib/serialize-bookmark';
import { tryNormalizeUrl } from '@/lib/url';
import { corsOptionsResponse, withCors } from '@/lib/cors';
import { getAuthUser, unauthorizedJson } from '@/lib/auth';

interface ImportItem {
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  tags?: string[];
  folders?: { name: string }[];
  notes?: string;
  isFavorite?: boolean;
}

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const body = await request.json();
    const items: ImportItem[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.bookmarks)
        ? body.bookmarks
        : [];

    if (items.length === 0) {
      return withCors(
        NextResponse.json({ error: 'No bookmarks found in import payload' }, { status: 400 }),
        origin
      );
    }

    let created = 0;
    let updated = 0;
    const results = [];

    for (const item of items) {
      if (!item.url || typeof item.url !== 'string') continue;
      const normalized = tryNormalizeUrl(item.url);
      if (!normalized) continue;

      const title =
        (typeof item.title === 'string' && item.title.trim()) ||
        new URL(normalized).hostname;
      const description =
        typeof item.description === 'string' ? item.description : '';
      const favicon =
        typeof item.favicon === 'string'
          ? item.favicon
          : `https://www.google.com/s2/favicons?domain=${new URL(normalized).hostname}&sz=64`;
      const tags = Array.isArray(item.tags)
        ? item.tags.filter((t): t is string => typeof t === 'string')
        : [];
      const notes = typeof item.notes === 'string' ? item.notes : '';
      const isFavorite = Boolean(item.isFavorite);
      const folderNames = [
        ...new Set(
          (Array.isArray(item.folders) ? item.folders : [])
            .map((f) => (f && typeof f.name === 'string' ? f.name.trim() : ''))
            .filter((name) => name.length > 0)
        ),
      ];

      const existing = await prisma.bookmark.findUnique({
        where: { userId_url: { userId: user.id, url: normalized } },
      });

      if (existing) {
        const row = await prisma.bookmark.update({
          where: { id: existing.id },
          data: {
            title,
            description,
            favicon,
            tags: JSON.stringify(tags),
            notes,
            isFavorite,
            folders: {
              set: [],
              connectOrCreate: folderNames.map((name) => ({
                where: { userId_name: { userId: user.id, name } },
                create: { userId: user.id, name },
              })),
            },
          },
          include: { folders: true },
        });
        updated += 1;
        results.push(serializeBookmark(row));
      } else {
        const row = await prisma.bookmark.create({
          data: {
            userId: user.id,
            url: normalized,
            title,
            description,
            favicon,
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
        created += 1;
        results.push(serializeBookmark(row));
      }
    }

    return withCors(
      NextResponse.json(
        { created, updated, total: results.length, bookmarks: results },
        { status: 200 }
      ),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import bookmarks';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
