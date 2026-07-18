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
    <div className="border border-border bg-surface p-8 sm:p-10">
      <div className="mb-8">
        <p className="font-display text-2xl font-medium tracking-tight text-fg">DevMark</p>
        <div className="mt-2 h-px w-12 bg-accent" />
        <h1 className="mt-6 font-display text-xl font-medium text-fg">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Private collection — invite only.</p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11 w-full border border-border bg-bg px-3.5 text-sm text-fg outline-none focus-visible:border-accent disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
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
            className="h-11 w-full border border-border bg-bg px-3.5 text-sm text-fg outline-none focus-visible:border-accent disabled:opacity-50"
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="border border-border bg-surface p-8 text-sm text-muted">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
