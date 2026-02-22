import { StarIcon, UserCircle2Icon } from 'lucide-react';
import { ReviewItem } from '@/data/dashboard/lustlocatiesData';

type ReviewsPanelProps = {
  reviews: ReviewItem[];
};

export function ReviewsPanel({ reviews }: ReviewsPanelProps) {
  return (
    <aside className="ll-card rounded-3xl border border-white/25 bg-white/20 p-5 backdrop-blur-sm transition-colors dark:border-slate-200/10 dark:bg-slate-900/40 lg:h-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recent reviews</h2>

      <div className="mt-4 space-y-3 lg:max-h-screen lg:overflow-y-auto lg:pr-2">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-white/25 bg-white/40 p-4 transition duration-300 hover:border-secondary-300 hover:shadow-lg hover:shadow-secondary-500/10 dark:border-slate-200/10 dark:bg-slate-900/60"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <UserCircle2Icon className="h-8 w-8 text-primary-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{review.author}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{review.time}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-500 px-2 py-1 text-xs font-semibold text-white">
                <StarIcon className="h-3 w-3" />
                {review.rating}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {review.text}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}
