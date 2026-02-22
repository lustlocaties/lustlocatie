import Image from 'next/image';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { navLinks } from '@/data/dashboard/lustlocatiesData';

export default function WorkInProgressPage() {
  return (
    <div className="ll-dashboard relative w-full overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/static/images/backdrop-8.webp"
          alt="Luxury hotel background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-100/80 to-slate-100/95 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/95" />
      </div>

      <div className="relative z-10 min-h-screen">
        <DashboardNav links={navLinks} />

        <div className="mx-auto flex min-h-[calc(100vh-6.5rem)] w-full max-w-4xl items-center justify-center px-4 py-8 md:px-6 lg:px-8">
          <div className="w-full rounded-3xl border border-white/30 bg-white/40 p-8 text-center backdrop-blur-xl dark:border-slate-200/10 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              Lustlocaties
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              Work in Progress
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              This page is currently being built.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
