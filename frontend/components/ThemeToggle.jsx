// components/ThemeToggle.jsx
'use client';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm shadow hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
      title="Toggle dark/light"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
