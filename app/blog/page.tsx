'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-xl transition hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-200/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-primary-400"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="mt-8 rounded-3xl border border-white/30 bg-white/70 p-8 backdrop-blur-xl dark:border-slate-200/10 dark:bg-slate-900/60 md:p-12">
          <h1 className="mb-6 font-display text-4xl font-bold text-slate-900 dark:text-slate-100 md:text-5xl">
            Blog
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Here we will write our blog
          </p>
        </div>
      </div>
    </div>
  );
}
