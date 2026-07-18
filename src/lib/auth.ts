import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient as createSupabaseJs, type User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { withCors } from '@/lib/cors';
import { isAllowedEmail } from '@/lib/allowed-email';

export type AuthUser = Pick<User, 'id' | 'email'>;
export { isAllowedEmail };

/**
 * Resolve the current user from cookie session (web) or Bearer token (extension).
 * Rejects users not in ALLOWED_EMAIL when that env is set.
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  const authHeader = request?.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (!token) return null;

    const supabase = createSupabaseJs(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    if (!isAllowedEmail(data.user.email)) return null;
    return { id: data.user.id, email: data.user.email };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (!isAllowedEmail(user.email)) return null;
  return { id: user.id, email: user.email };
}

export function unauthorizedJson(origin: string | null = null) {
  return withCors(
    NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    origin
  );
}
