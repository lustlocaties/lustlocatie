import { CalendarDaysIcon, MapPinIcon, SearchIcon, UsersIcon } from 'lucide-react';
import type { ComponentType } from 'react';

type SearchField = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const searchFields: SearchField[] = [
  { id: 'location', label: 'Location', icon: MapPinIcon },
  { id: 'checkin', label: 'Check-in', icon: CalendarDaysIcon },
  { id: 'checkout', label: 'Check-out', icon: CalendarDaysIcon },
  { id: 'guests', label: 'Guests', icon: UsersIcon },
];

export function SearchBar() {
  return (
    <section className="rounded-3xl border border-white/25 bg-white/20 p-3 backdrop-blur-xl transition-colors dark:border-slate-200/10 dark:bg-slate-900/40 md:p-4">
      <form className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {searchFields.map((field) => (
          <label
            key={field.id}
            className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/30 bg-white/40 px-4 py-3 text-sm text-slate-700 transition hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <field.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder={field.label}
              className="w-full border-none bg-transparent p-0 text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:ring-0 dark:placeholder:text-slate-400"
            />
          </label>
        ))}

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition duration-300 hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <SearchIcon className="h-4 w-4" />
          Search stays
        </button>
      </form>
    </section>
  );
}
