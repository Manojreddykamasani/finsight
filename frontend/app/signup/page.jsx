// app/signup/page.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/Input';
import AuthCard from '@/components/AuthCard';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setInfo('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Signup failed');
      setInfo('Account created. Please check your email for the OTP.');
      router.push('/verify-otp?email=' + encodeURIComponent(email));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <AuthCard title="Create your account" subtitle="Join Finsight in minutes">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" name="name" placeholder="Jane Doe" required />
          <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
          <Input label="Password" name="password" type="password" placeholder="Strong password" required />
          {info && <p className="text-sm text-green-600">{info}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          <p className="text-center text-sm">
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
