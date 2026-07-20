import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: { _count: { select: { bookmarks: true } } },
      orderBy: { name: 'asc' },
    });

    const result = folders.map((f) => ({
      id: f.id,
      name: f.name,
      count: f._count.bookmarks,
    }));

    return withCors(NextResponse.json(result, { status: 200 }), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch folders';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return withCors(
        NextResponse.json({ error: 'Folder name is required' }, { status: 400 }),
        origin
      );
    }

    const existing = await prisma.folder.findUnique({
      where: { userId_name: { userId: user.id, name } },
    });
    if (existing) {
      return withCors(
        NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 }),
        origin
      );
    }

    const folder = await prisma.folder.create({
      data: { userId: user.id, name },
    });

    return withCors(
      NextResponse.json({ id: folder.id, name: folder.name, count: 0 }, { status: 201 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create folder';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
