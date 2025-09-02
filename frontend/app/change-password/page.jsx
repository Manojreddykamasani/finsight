// app/change-password/page.jsx
'use client';
import AuthGuard from '@/components/AuthGuard';
import Input from '@/components/Input';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ChangePasswordPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const currentPassword = form.get('currentPassword');
    const newPassword = form.get('newPassword');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Change password failed');
      setMsg('Password changed successfully.');
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">Change password</h1>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Input label="Current password" name="currentPassword" type="password" required />
            <Input label="New password" name="newPassword" type="password" required />
            {msg && <p className="text-sm text-green-600">{msg}</p>}
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn-primary" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
