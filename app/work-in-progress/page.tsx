export default function WorkInProgressPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4">
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
  );
}
