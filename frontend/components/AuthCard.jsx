// components/AuthCard.jsx
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        <div className="mt-5 space-y-4">{children}</div>
        {footer && <div className="mt-6 text-sm">{footer}</div>}
      </div>
    </div>
  );
}
