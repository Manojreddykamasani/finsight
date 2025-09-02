// components/Navbar.jsx
'use client';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const router = useRouter();

  // close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/login'); // 👈 navigate to login
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-950/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Finsight" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">Finsight</span>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!token ? (
            // Not logged in
            <>
              <Link href="/login" className="btn-outline">Login</Link>
              <Link href="/signup" className="btn-primary">Create account</Link>
            </>
          ) : (
            // Logged in dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-semibold"
              >
                {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                  <Link
                    href="/change-password"
                    className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setOpen(false)}
                  >
                    Change Password
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setOpen(false)}
                  >
                    Forgot Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
