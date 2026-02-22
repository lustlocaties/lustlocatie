import Image from 'next/image';
import { HeartIcon, MapPinIcon, StarIcon } from 'lucide-react';
import { FeaturedStay } from '@/data/dashboard/lustlocatiesData';

type FeaturedStaysProps = {
  stays: FeaturedStay[];
};

export function FeaturedStays({ stays }: FeaturedStaysProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 lg:text-3xl">
          Featured stays
        </h2>
        <button className="text-sm font-medium text-primary-600 transition hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-primary-400">
          View all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stays.map((stay) => (
          <article
            key={stay.id}
            className="group overflow-hidden rounded-3xl border border-white/25 bg-white/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-500/20 dark:border-slate-200/10 dark:bg-slate-900/40 dark:hover:border-primary-700"
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={stay.image}
                alt={stay.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <button
                aria-label={`Save ${stay.name}`}
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-slate-950/40 text-white backdrop-blur transition hover:border-secondary-300 hover:text-secondary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
              >
                <HeartIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{stay.name}</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <MapPinIcon className="h-4 w-4 text-primary-500" />
                    {stay.city}
                  </p>
                </div>
                <span className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary-500 px-3 py-1 text-sm font-semibold text-white shadow-lg shadow-primary-500/25">
                  <StarIcon className="h-4 w-4" />
                  {stay.rating}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Privacy</span>
                  <span>{stay.privacyScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${stay.privacyScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Couple Score</span>
                  <span>{stay.romanceScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                  <div
                    className="h-full rounded-full bg-secondary-500"
                    style={{ width: `${stay.romanceScore}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {stay.tags.map((tag) => (
                  <span
                    key={`${stay.id}-${tag}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/30 bg-white/40 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
