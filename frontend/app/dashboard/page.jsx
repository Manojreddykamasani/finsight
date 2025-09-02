// app/dashboard/page.jsx
'use client';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Previewing Finsight’s research surface. Authentication wired; simulation modules coming next.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm font-semibold">Market Sessions</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Pre-market prep · Live · Post-market outlook
            </p>
            <div className="mt-4 rounded-xl border border-neutral-200/60 p-4 text-sm dark:border-neutral-800/60">
              Session: Continuous Trading<br/> Turnover: — <br/>Last Price: —
            </div>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold">Agent Personas</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Conservative (risk-averse)</li>
              <li>• Aggressive (high turnover)</li>
              <li>• Balanced (trend-aware)</li>
              <li>• Growth-oriented (momentum)</li>
            </ul>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold">Valuation Rails</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              FCFF · WACC · CAPM anchors for ideal ranges.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3 dark:border-neutral-800/60">
                Stock A: 46–49 (Q paths)
              </div>
              <div className="rounded-lg border p-3 dark:border-neutral-800/60">
                Stock B: 38–43 (Q paths)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm font-semibold">BBS Pulse</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">End-of-day tips inform next-day behavior.</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-lg border p-3 dark:border-neutral-800/60">“Expect volatility; monitor rate talk.”</div>
              <div className="rounded-lg border p-3 dark:border-neutral-800/60">“A looks strong into earnings.”</div>
            </div>
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold">Capital & Risk</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Loans, maturities, bankruptcy checks, fee frictions.</p>
            <div className="mt-3 rounded-lg border p-4 text-sm dark:border-neutral-800/60">
              Loans outstanding: — · Next maturity: —<br/>
              Stamp tax: 0.005/share · Min 1 · Max 5.95
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
