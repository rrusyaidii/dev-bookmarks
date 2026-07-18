'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
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
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [capturingRecovery, setCapturingRecovery] = useState(false);

  // Recovery emails land on Site URL (/login) with tokens in the hash.
  // Wait for Supabase to consume the hash before navigating away.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    const isRecovery = hash.includes('type=recovery');
    if (!isRecovery) {
      // Already signed in (normal session) → shelf
      const supabase = createClient();
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/');
        }
      });
      return;
    }

    setCapturingRecovery(true);
    const supabase = createClient();

    const goReset = () => {
      router.replace('/reset-password');
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        goReset();
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) goReset();
    });

    return () => subscription.unsubscribe();
  }, [next, router]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

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

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError('Enter your email first, then request a reset.');
      return;
    }

    setResetting(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    setResetting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }

    setInfo('Check your email for a reset link. It opens the set-password page.');
  };

  if (capturingRecovery) {
    return (
      <div className="signal-enter relative shelf-card p-8 sm:p-10">
        <p className="font-display text-3xl font-bold tracking-tight text-fg">DevMark</p>
        <div className="signal-rule mt-2 h-0.5 w-12 rounded-full bg-accent" />
        <p className="mt-6 text-sm text-muted">Opening set-password…</p>
      </div>
    );
  }

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
            disabled={loading || resetting}
            className="input-field h-11"
            autoComplete="email"
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
            disabled={loading || resetting}
            className="input-field h-11"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}
        {info && <p className="text-sm text-muted">{info}</p>}

        <button type="submit" disabled={loading || resetting} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleForgotPassword}
        disabled={loading || resetting}
        className="mt-4 w-full text-center font-mono text-[11px] uppercase tracking-wider text-muted transition hover:text-fg"
      >
        {resetting ? 'Sending reset…' : 'Forgot password?'}
      </button>
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
