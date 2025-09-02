// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 py-10 text-sm text-neutral-500 dark:border-neutral-800/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Finsight. All rights reserved.</p>
          <p className="opacity-80">Built for research & simulation purposes.</p>
        </div>
      </div>
    </footer>
  );
}
