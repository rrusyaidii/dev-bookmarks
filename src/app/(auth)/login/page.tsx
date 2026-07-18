'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    authError === 'forbidden'
      ? 'This account is not allowed. Private app — owner only.'
      : authError
        ? 'Authentication failed. Please try again.'
        : null
  );
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <div className="glass rounded-2xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-fg">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to DevMark</p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-fg outline-none focus:border-accent/40 disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-fg">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-fg outline-none focus:border-accent/40 disabled:opacity-50"
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-accent/15 text-sm font-semibold text-accent hover:bg-accent/25 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-xs text-muted">Private app — invite only.</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="glass rounded-2xl p-8 text-sm text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
