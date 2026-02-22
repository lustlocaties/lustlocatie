import { CheckCircle2Icon, ShieldIcon, SparklesIcon } from 'lucide-react';

type HeroSectionProps = {
  badges: string[];
};

const badgeIcons = [CheckCircle2Icon, SparklesIcon, ShieldIcon];

export function HeroSection({ badges }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/20 px-4 py-10 text-center backdrop-blur-xl transition-colors dark:border-slate-200/10 dark:bg-slate-900/40 md:px-8 md:py-14 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 lg:text-6xl">
          Discover discreet stays made for private moments
        </h1>
        <p className="mt-3 font-cursive text-xl text-primary-500 drop-shadow-sm md:text-2xl">
          Private • Discreet • Couple-Friendly
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge, index) => {
            const Icon = badgeIcons[index] ?? CheckCircle2Icon;
            return (
              <span
                key={badge}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-200"
              >
                <Icon className="h-4 w-4 text-primary-500" />
                {badge}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
