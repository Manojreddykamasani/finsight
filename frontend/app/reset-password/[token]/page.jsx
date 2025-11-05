// app/reset-password/[token]/page.jsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthCard from '@/components/AuthCard';
import Input from '@/components/Input';

export default function ResetPasswordPage() {
  const { token } = useParams(); // grab token from URL
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get('password');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/${token}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Reset failed');

      setMsg('Password reset successful. Redirecting to login…');
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <AuthCard
        title="Reset your password"
        subtitle="Enter your new password below"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="New Password"
            name="password"
            type="password"
            placeholder="Enter new password"
            required
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
