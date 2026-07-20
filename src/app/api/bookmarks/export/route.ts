import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBookmark } from '@/lib/serialize-bookmark';
import { corsOptionsResponse, withCors } from '@/lib/cors';
import { getAuthUser, unauthorizedJson } from '@/lib/auth';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { folders: true },
      orderBy: { createdAt: 'desc' },
    });

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks: bookmarks.map(serializeBookmark),
    };

    return withCors(
      new NextResponse(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="devmark-backup-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export bookmarks';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
