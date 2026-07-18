'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/AppearanceControls';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const ensureSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        if (!data.session) {
          setError('Reset link expired or invalid. Request a new one from Sign in.');
        }
        setReady(true);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setError(null);
        setReady(true);
      }
    });

    void ensureSession();
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <div className="signal-enter relative shelf-card p-8 sm:p-10">
      <ModeToggle className="absolute right-3 top-3" />
      <div className="mb-8">
        <p className="font-display text-3xl font-bold tracking-tight text-fg">DevMark</p>
        <div className="signal-rule mt-2 h-0.5 w-12 rounded-full bg-accent" />
        <h1 className="mt-6 font-display text-xl font-bold text-fg">Set new password</h1>
        <p className="mt-1 text-sm text-muted">Choose a password for your shelf.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || !ready}
            className="input-field h-11"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading || !ready}
            className="input-field h-11"
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <button type="submit" disabled={loading || !ready} className="btn-primary w-full">
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="shelf-card p-8 text-sm text-muted">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
