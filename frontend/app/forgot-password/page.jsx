// app/forgot-password/page.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/components/AuthCard';
import Input from '@/components/Input';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get('email');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Request failed');
      setMsg('Reset link sent if the email exists.');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <AuthCard title="Forgot password" subtitle="We’ll email you a reset link">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-neutral-600 hover:underline dark:text-neutral-300">Back to login</Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
