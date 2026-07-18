'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { ModeToggle } from '@/components/AppearanceControls';
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
    <div className="signal-enter relative shelf-card p-8 sm:p-10">
      <ModeToggle className="absolute right-3 top-3" />
      <div className="mb-8">
        <p className="font-display text-3xl font-bold tracking-tight text-fg">DevMark</p>
        <div className="signal-rule mt-2 h-0.5 w-12 rounded-full bg-accent" />
        <h1 className="mt-6 font-display text-xl font-bold text-fg">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Private shelf — invite only.</p>
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
            className="input-field h-11"
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
            className="input-field h-11"
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
    <Suspense fallback={<div className="shelf-card p-8 text-sm text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
