import {
  ArrowRightIcon,
  MapPinnedIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react';

const scoreCards = [
  {
    id: 'privacy-score',
    title: 'Privacy Score',
    value: 94,
    tone: 'success',
    chip: 'Verified zones',
    icon: ShieldCheckIcon,
    barClass: 'bg-emerald-500',
  },
  {
    id: 'couple-score',
    title: 'Couple Score',
    value: 89,
    tone: 'accent',
    chip: 'Romance index',
    icon: SparklesIcon,
    barClass: 'bg-secondary-500',
  },
] as const;

const mapPins = [
  'left-8 top-8',
  'left-1/2 top-16 -translate-x-1/2',
  'right-10 top-1/2 -translate-y-1/2',
  'left-12 bottom-8',
  'right-16 bottom-10',
];

export function MetricsMapRow() {
  return (
    <section className="ll-metrics grid grid-cols-1 gap-6 lg:grid-cols-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
        {scoreCards.map((card) => (
          <article
            key={card.id}
            className="ll-card ll-card-elevated rounded-3xl border border-white/25 bg-white/20 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-200/10 dark:bg-slate-900/40 dark:hover:border-primary-700"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</p>
              <card.icon className="h-5 w-5 text-primary-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">{card.value}%</p>

            <div className="mt-4 h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-700/60">
              <div
                className={`h-full rounded-full ${card.barClass}`}
                style={{ width: `${card.value}%` }}
              />
            </div>

            <span className="mt-4 inline-flex min-h-11 items-center rounded-full border border-white/30 bg-white/40 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-300">
              {card.chip}
            </span>
          </article>
        ))}
      </div>

      <article className="ll-card ll-card-elevated ll-key-feature relative overflow-hidden rounded-3xl border border-white/25 bg-white/20 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-200/10 dark:bg-slate-900/40 lg:col-span-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Live privacy map</h3>
          <MapPinnedIcon className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="relative mt-4 h-56 rounded-2xl border border-white/25 bg-gradient-to-br from-primary-200/30 via-slate-100/50 to-secondary-200/30 dark:border-slate-200/10 dark:from-primary-900/30 dark:via-slate-900/70 dark:to-secondary-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent)]" />
          {mapPins.map((pin) => (
            <span
              key={pin}
              className={`absolute h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60 ${pin}`}
            />
          ))}
        </div>

        <button className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-200/10 dark:bg-slate-800 dark:hover:bg-slate-700">
          Explore map
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </article>
    </section>
  );
}
