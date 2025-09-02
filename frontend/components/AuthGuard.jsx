// components/AuthGuard.jsx
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from './Loading';

export default function AuthGuard({ children }) {
  const { token } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [token, router]);

  if (!ready) return <div className="mx-auto max-w-7xl px-4 py-10"><Loading /></div>;
  return children;
}
