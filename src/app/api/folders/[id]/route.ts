import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { corsOptionsResponse, withCors } from '@/lib/cors';
import { getAuthUser, unauthorizedJson } from '@/lib/auth';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const { id } = await params;
    const existing = await prisma.folder.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return withCors(NextResponse.json({ error: 'Folder not found' }, { status: 404 }), origin);
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return withCors(
        NextResponse.json({ error: 'Folder name is required' }, { status: 400 }),
        origin
      );
    }

    if (name !== existing.name) {
      const dup = await prisma.folder.findUnique({
        where: { userId_name: { userId: user.id, name } },
      });
      if (dup) {
        return withCors(
          NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 }),
          origin
        );
      }
    }

    const folder = await prisma.folder.update({ where: { id }, data: { name } });

    return withCors(
      NextResponse.json({ id: folder.id, name: folder.name }, { status: 200 }),
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update folder';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin');
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedJson(origin);

    const { id } = await params;
    const existing = await prisma.folder.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return withCors(NextResponse.json({ error: 'Folder not found' }, { status: 404 }), origin);
    }

    await prisma.folder.delete({ where: { id } });

    return withCors(NextResponse.json({ message: 'Folder deleted' }, { status: 200 }), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete folder';
    return withCors(NextResponse.json({ error: message }, { status: 500 }), origin);
  }
}
