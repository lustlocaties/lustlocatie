'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShieldCheckIcon,
  XIcon,
} from 'lucide-react';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';

type DashboardNavProps = {
  links: string[];
};

export function DashboardNav({ links }: DashboardNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl transition-colors dark:border-slate-200/10 dark:bg-slate-950/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              StayPrivate
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discreet stays</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link, index) => (
            <Link
              key={link}
              href="#"
              className={`text-sm font-medium transition-colors duration-300 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-offset-slate-950 ${
                index === 0
                  ? 'text-primary-500 underline decoration-primary-500 underline-offset-8'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Quick search"
            className="hidden h-11 items-center justify-center rounded-full border border-white/30 bg-white/40 px-4 text-slate-700 transition hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-200 md:flex"
          >
            <SearchIcon className="h-4 w-4" />
          </button>

          <div className="rounded-full border border-white/30 bg-white/40 p-2 text-slate-700 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-100">
            <ThemeSwitch />
          </div>

          <button className="hidden h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:inline-flex">
            <HeartIcon className="h-4 w-4" />
            Sign in
          </button>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/40 text-slate-700 transition hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-100 md:hidden"
          >
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/20 px-4 pb-4 md:hidden dark:border-slate-200/10">
          <div className="space-y-3 rounded-2xl border border-white/25 bg-white/50 p-4 backdrop-blur-xl dark:border-slate-200/10 dark:bg-slate-900/60">
            {links.map((link) => (
              <Link
                key={link}
                href="#"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {link}
              </Link>
            ))}
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              <HeartIcon className="h-4 w-4" />
              Sign in
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
