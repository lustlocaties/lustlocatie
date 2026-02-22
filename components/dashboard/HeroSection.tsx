export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/20 px-4 py-10 text-center backdrop-blur-xl transition-colors dark:border-slate-200/10 dark:bg-slate-900/40 md:px-8 md:py-14 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 lg:text-6xl">
          Discover discreet stays made for private moments
        </h1>
        <p className="mt-3 font-cursive text-xl text-primary-500 drop-shadow-sm md:text-2xl">
          Private • Discreet • Couple-Friendly
        </p>
      </div>
    </section>
  );
}
