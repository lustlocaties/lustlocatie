import { BadgeCheckIcon, HeadsetIcon, ShieldCheckIcon } from 'lucide-react';
import { TrustBadge } from '@/data/dashboard/lustlocatiesData';

type TrustBadgesProps = {
  badges: TrustBadge[];
};

const icons = [BadgeCheckIcon, ShieldCheckIcon, HeadsetIcon];

export function TrustBadges({ badges }: TrustBadgesProps) {
  return (
    <section className="ll-card flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-white/25 bg-white/20 p-4 backdrop-blur-sm dark:border-slate-200/10 dark:bg-slate-900/40">
      {badges.map((badge, index) => {
        const Icon = icons[index] ?? BadgeCheckIcon;

        return (
          <span
            key={badge.id}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <Icon className="h-4 w-4 text-primary-500" />
            {badge.label}
          </span>
        );
      })}
    </section>
  );
}
