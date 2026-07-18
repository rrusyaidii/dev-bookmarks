import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { tryNormalizeUrl } from '@/lib/url';
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

    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return withCors(
        NextResponse.json({ error: 'URL query param is required' }, { status: 400 }),
        origin
      );
    }

    const normalized = tryNormalizeUrl(url);
    if (!normalized) {
      return withCors(
        NextResponse.json({ exists: false, id: null }, { status: 200 }),
        origin
      );
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_url: { userId: user.id, url: normalized } },
      select: { id: true, title: true },
    });

    return withCors(
      NextResponse.json(
        {
          exists: Boolean(existing),
          id: existing?.id ?? null,
          title: existing?.title ?? null,
          normalizedUrl: normalized,
        },
        { status: 200 }
      ),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check URL';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
