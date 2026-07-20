import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { suggestTags } from '@/lib/ai-tagger';
import { serializeBookmark } from '@/lib/serialize-bookmark';
import { corsOptionsResponse, withCors } from '@/lib/cors';
import { getAuthUser, unauthorizedJson } from '@/lib/auth';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    let ids: string[] | undefined;
    try {
      const body = await request.json();
      if (Array.isArray(body?.ids)) {
        ids = body.ids.filter((id: unknown): id is string => typeof id === 'string');
      }
    } catch {
      // empty body = retag all
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        ...(ids?.length ? { id: { in: ids } } : {}),
      },
    });

    const updated = [];
    for (const b of bookmarks) {
      const tags = await suggestTags(b.title, b.description, b.url);
      const row = await prisma.bookmark.update({
        where: { id: b.id },
        data: { tags: JSON.stringify(tags) },
        include: { folders: true },
      });
      updated.push(serializeBookmark(row));
    }

    return withCors(
      NextResponse.json(
        { count: updated.length, bookmarks: updated },
        { status: 200 }
      ),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retag bookmarks';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
