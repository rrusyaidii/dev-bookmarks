import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { serializeBookmark } from '@/lib/serialize-bookmark';
import { tryNormalizeUrl } from '@/lib/url';
import { corsOptionsResponse, withCors } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  try {
    const { id } = await params;
    const bookmark = await prisma.bookmark.findUnique({ where: { id } });

    if (!bookmark) {
      return withCors(
        NextResponse.json({ error: 'Bookmark not found' }, { status: 404 }),
        origin
      );
    }

    return withCors(
      NextResponse.json(serializeBookmark(bookmark), { status: 200 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch bookmark';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  try {
    const { id } = await params;
    const existing = await prisma.bookmark.findUnique({ where: { id } });

    if (!existing) {
      return withCors(
        NextResponse.json({ error: 'Bookmark not found' }, { status: 404 }),
        origin
      );
    }

    const body = await request.json();
    const {
      url,
      title,
      description,
      favicon,
      tags,
      notes,
      isFavorite,
      linkStatus,
    } = body as {
      url?: string;
      title?: string;
      description?: string;
      favicon?: string;
      tags?: string[];
      notes?: string;
      isFavorite?: boolean;
      linkStatus?: string;
    };

    let normalizedUrl: string | undefined;
    if (url !== undefined) {
      const n = tryNormalizeUrl(url);
      if (!n) {
        return withCors(
          NextResponse.json({ error: 'Invalid URL' }, { status: 400 }),
          origin
        );
      }
      if (n !== existing.url) {
        const dup = await prisma.bookmark.findUnique({ where: { url: n } });
        if (dup && dup.id !== id) {
          return withCors(
            NextResponse.json(
              { error: 'Bookmark with this URL already exists', id: dup.id },
              { status: 409 }
            ),
            origin
          );
        }
      }
      normalizedUrl = n;
    }

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        ...(normalizedUrl !== undefined && { url: normalizedUrl }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(favicon !== undefined && { favicon }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(notes !== undefined && { notes }),
        ...(isFavorite !== undefined && { isFavorite: Boolean(isFavorite) }),
        ...(linkStatus !== undefined && { linkStatus }),
      },
    });

    return withCors(
      NextResponse.json(serializeBookmark(bookmark), { status: 200 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update bookmark';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  try {
    const { id } = await params;
    const existing = await prisma.bookmark.findUnique({ where: { id } });

    if (!existing) {
      return withCors(
        NextResponse.json({ error: 'Bookmark not found' }, { status: 404 }),
        origin
      );
    }

    await prisma.bookmark.delete({ where: { id } });

    return withCors(
      NextResponse.json({ message: 'Bookmark deleted' }, { status: 200 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete bookmark';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
