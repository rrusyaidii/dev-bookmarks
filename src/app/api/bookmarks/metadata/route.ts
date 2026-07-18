import { NextRequest, NextResponse } from 'next/server';
import { fetchPageMetadata } from '@/lib/fetch-metadata';
import { corsOptionsResponse, withCors } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request.headers.get('origin'));
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return withCors(
        NextResponse.json({ error: 'URL query param is required' }, { status: 400 }),
        origin
      );
    }

    const metadata = await fetchPageMetadata(url);
    return withCors(NextResponse.json(metadata, { status: 200 }), origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch metadata';
    return withCors(NextResponse.json({ error: message }, { status: 400 }), origin);
  }
}
