'use client';

import { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import {
  cityOptionsByCountry,
  countryOptions,
  stayTags,
  type StayTag,
} from '@/data/dashboard/lustlocatiesData';

export function SearchBar() {
  const [selectedTags, setSelectedTags] = useState<StayTag[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const availableCities = selectedCountry
    ? cityOptionsByCountry[selectedCountry] ?? []
    : [];

  const toggleTag = (tag: StayTag) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((currentTag) => currentTag !== tag)
        : [...current, tag],
    );
  };

  return (
    <section className="ll-card ll-search rounded-3xl border border-white/25 bg-white/20 p-3 backdrop-blur-sm transition-colors dark:border-slate-200/10 dark:bg-slate-900/40 md:p-4">
      <div className="rounded-2xl border border-white/30 bg-white/35 p-4 dark:border-slate-200/10 dark:bg-slate-900/55">
        <p className="ll-label text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Normal Search
        </p>

        <form className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex min-h-11 items-center rounded-2xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-700 transition hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30 dark:border-slate-200/10 dark:bg-slate-900/70 dark:text-slate-100">
            <select
              aria-label="Country"
              className="w-full rounded-xl border-none bg-white p-0 text-sm font-medium text-slate-800 focus:outline-none focus:ring-0 dark:bg-slate-900 dark:text-slate-100"
              value={selectedCountry}
              onChange={(event) => {
                setSelectedCountry(event.target.value);
                setSelectedCity('');
              }}
            >
              <option value="" disabled>
                Country
              </option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-11 items-center rounded-2xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-700 transition hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30 dark:border-slate-200/10 dark:bg-slate-900/70 dark:text-slate-100">
            <select
              aria-label="City"
              className="w-full rounded-xl border-none bg-white p-0 text-sm font-medium text-slate-800 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100"
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              disabled={!selectedCountry}
            >
              <option value="" disabled>
                {selectedCountry ? 'City' : 'Choose country first'}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </form>

        <div className="mt-4 rounded-2xl border border-white/30 bg-white/30 p-3 dark:border-slate-200/10 dark:bg-slate-900/50">
          <p className="ll-label mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tags
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stayTags.map((tag) => {
              const checked = selectedTags.includes(tag);

              return (
                <label
                  key={tag}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-700 transition hover:border-primary-300 dark:border-slate-200/10 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTag(tag)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500 dark:border-slate-600"
                  />
                  <span>{tag}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="my-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/40 dark:bg-slate-200/10" />
        <span className="ll-label rounded-full border border-white/30 bg-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-200/10 dark:bg-slate-900/60 dark:text-slate-300">
          OR use AI Search
        </span>
        <span className="h-px flex-1 bg-white/40 dark:bg-slate-200/10" />
      </div>

      <div className="ll-hero-accent ll-ai-search mt-3 rounded-2xl border border-primary-300/60 bg-primary-50/70 p-3 dark:border-primary-700/60 dark:bg-primary-950/30 md:p-4">
        <p className="ll-label text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
          AI Search
        </p>

        <form className="mt-2 flex flex-col gap-2 md:flex-row md:items-stretch">
          <label className="flex h-11 w-full flex-1 items-center gap-2 rounded-xl border border-primary-200/80 bg-white/70 px-3 text-sm text-slate-700 transition-colors hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/30 dark:border-primary-800/70 dark:bg-slate-900/70 dark:text-slate-200">
            <SearchIcon className="h-4 w-4 text-primary-500" />
            <input
              type="text"
              placeholder="Describe what you need, for example a soundproof room in Amsterdam"
              className="h-full w-full border-none bg-transparent p-0 text-sm font-medium placeholder:text-slate-500 focus:outline-none focus:ring-0 dark:placeholder:text-slate-400"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 md:w-auto md:min-w-36"
          >
            <SearchIcon className="h-4 w-4" />
            AI Search
          </button>
        </form>
      </div>
    </section>
  );
}
