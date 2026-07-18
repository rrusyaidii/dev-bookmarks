import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTagColor } from '@/lib/tag-colors';
import { corsOptionsResponse, withCors } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const bookmarks = await prisma.bookmark.findMany({
      select: { tags: true },
    });

    const counts = new Map<string, number>();

    for (const b of bookmarks) {
      let tags: string[] = [];
      try {
        const parsed = JSON.parse(b.tags) as unknown;
        tags = Array.isArray(parsed)
          ? parsed.filter((t): t is string => typeof t === 'string')
          : [];
      } catch {
        tags = [];
      }
      for (const tag of tags) {
        const key = tag.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }

    const result = [...counts.entries()]
      .map(([name, count]) => ({
        name,
        count,
        color: getTagColor(name),
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return withCors(NextResponse.json(result, { status: 200 }), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tags';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
