import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { suggestTags } from '@/lib/ai-tagger';
import { serializeBookmark } from '@/lib/serialize-bookmark';
import { corsOptionsResponse, withCors } from '@/lib/cors';
import { getAuthUser, unauthorizedJson } from '@/lib/auth';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const { id } = await params;
    const existing = await prisma.bookmark.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return withCors(
        NextResponse.json({ error: 'Bookmark not found' }, { status: 404 }),
        origin
      );
    }

    const tags = await suggestTags(
      existing.title,
      existing.description,
      existing.url
    );

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: { tags: JSON.stringify(tags) },
      include: { folders: true },
    });

    return withCors(
      NextResponse.json(serializeBookmark(bookmark), { status: 200 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retag bookmark';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
