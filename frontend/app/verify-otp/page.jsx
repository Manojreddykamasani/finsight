'use client';
export const dynamic = 'force-dynamic';

// We need to import Suspense
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthCard from '@/components/AuthCard';
import Input from '@/components/Input';
import { useAuth } from '@/context/AuthContext';

// --- Step 1: Move all your logic into a new component ---
// This component uses the hooks, so it's the one that needs Suspense
function VerifyOtpComponent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const otp = form.get('otp');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Verification failed');
      login({ token: data.token, user: data.user || { email } });
      router.push('/dashboard');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthCard title="Verify your email" subtitle={`We sent an OTP to ${email || 'your email'}`}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="One-Time Password (OTP)" name="otp" placeholder="Enter 6-digit code" required />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Verifying…' : 'Verify & Continue'}</button>
      </form>
    </AuthCard>
  );
}

// --- Step 2: Export a page that wraps your component in <Suspense> ---
// This is now the default export for the page
export default function VerifyOtpPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Suspense will show a fallback UI while VerifyOtpComponent (which uses useSearchParams)
        is loading on the client.
      */}
      <Suspense fallback={<p>Loading verification form...</p>}>
        <VerifyOtpComponent />
      </Suspense>
    </div>
  );
}