// app/page.jsx
'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="gradient-hero">
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Finsight — AI-Native Market Simulation
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              Explore a high-fidelity trading sandbox where autonomous investor agents, fundamentals,
              and external events collide. Evaluate strategies with realistic frictions and sentiment flow.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/signup" className="btn-primary">Get started</Link>
              <Link href="/login" className="btn-outline">Sign in</Link>
            </div>
            <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
              Simulated environment. Not investment advice.
            </p>
          </div>

          <div className="card p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/30 p-4 dark:border-white/10">
                <p className="text-sm font-medium">Agent Personas</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Conservative, Aggressive, Balanced, Growth — diverse behaviors drive market micro-dynamics.
                </p>
              </div>
              <div className="rounded-xl border border-white/30 p-4 dark:border-white/10">
                <p className="text-sm font-medium">Order Book Engine</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Bid/ask matching with session price updates and stamp-tax fee modeling.
                </p>
              </div>
              <div className="rounded-xl border border-white/30 p-4 dark:border-white/10">
                <p className="text-sm font-medium">Macro & Events</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Toggle interest-rate shifts, easing/hikes, and earnings to test regime sensitivity.
                </p>
              </div>
              <div className="rounded-xl border border-white/30 p-4 dark:border-white/10">
                <p className="text-sm font-medium">BBS Signal Flow</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  End-of-day agent tips propagate sentiment into next-day actions.
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/30 p-4 dark:border-white/10">
                <p className="text-sm font-medium">Fundamentals</p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  FCFF-based valuation, WACC, CAPM — drive intrinsic ranges and IPO/seasonal baselines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards row */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Sessioned Trading</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Pre-market prep, continuous session, and post-session outlooks for realistic cadence.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Capital & Leverage</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Loans, maturities, and bankruptcy checks reinforce capital constraints and risk.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Behavioral Lenses</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Personality-conditioned tendencies and crowd effects surface emergent market patterns.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-neutral-200/60 p-6 dark:border-neutral-800/60">
          <h4 className="text-base font-semibold">Why Finsight?</h4>
          <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
            <li>No leakage: simulation decoupled from future knowledge.</li>
            <li>Event-driven microstructure with matching & fees.</li>
            <li>Scenario toggles: interest, liquidity, earnings, chatter.</li>
            <li>Valuation rails to anchor prices within rational bands.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
