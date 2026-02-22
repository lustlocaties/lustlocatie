import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="ll-card ll-hero relative overflow-hidden rounded-3xl border border-white/25 bg-white/20 px-4 py-6 backdrop-blur-sm transition-colors dark:border-slate-200/10 dark:bg-slate-900/40 md:px-8 md:py-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center md:flex-row md:items-center md:gap-6 md:text-left">
        <div className="flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 md:h-[22rem] md:w-[22rem]">
          <Image
            src="/static/images/logo.png"
            alt="Lustlocaties logo"
            width={352}
            height={352}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 drop-shadow-md dark:text-slate-100 sm:text-4xl lg:text-5xl">
            Discover discreet stays made for private moments
          </h1>
          <p className="mt-3 font-cursive text-lg text-primary-500 drop-shadow-sm sm:text-xl">
            Private • Discreet • Couple-Friendly
          </p>
        </div>
      </div>
    </section>
  );
}
