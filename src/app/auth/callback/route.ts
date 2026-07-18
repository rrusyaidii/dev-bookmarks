import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNextPath(next: string | null, type: string | null): string {
  if (type === 'recovery') return '/reset-password';
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  if (next === '/login') return '/';
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = safeNextPath(searchParams.get('next'), type);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
