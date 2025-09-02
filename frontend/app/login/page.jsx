// app/login/page.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/Input';
import AuthCard from '@/components/AuthCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      // Expecting { token, user }
      login({ token: data.token, user: data.user || { email } });
      router.push('/dashboard');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <AuthCard title="Welcome back" subtitle="Log in to your Finsight account">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
          <Input label="Password" name="password" type="password" placeholder="••••••••" required />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
            <Link href="/signup" className="text-neutral-600 hover:underline dark:text-neutral-300">Create account</Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
