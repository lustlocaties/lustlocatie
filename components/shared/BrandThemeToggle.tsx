'use client';

import { useEffect, useState } from 'react';
import { GemIcon } from 'lucide-react';

const STORAGE_KEY = 'brand-theme';
const LUXE_CLASS = 'theme-luxe';

export function BrandThemeToggle({
  className = '',
  withLabel = true,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [isLuxe, setIsLuxe] = useState(false);

  useEffect(() => {
    const htmlClassList = document.documentElement.classList;
    const initialLuxe =
      htmlClassList.contains(LUXE_CLASS) ||
      window.localStorage.getItem(STORAGE_KEY) === 'luxe';

    htmlClassList.toggle(LUXE_CLASS, initialLuxe);
    setIsLuxe(initialLuxe);
    setMounted(true);
  }, []);

  const toggleBrandTheme = () => {
    const nextIsLuxe = !isLuxe;
    document.documentElement.classList.toggle(LUXE_CLASS, nextIsLuxe);
    window.localStorage.setItem(STORAGE_KEY, nextIsLuxe ? 'luxe' : 'classic');
    setIsLuxe(nextIsLuxe);
  };

  return (
    <button
      type="button"
      aria-pressed={isLuxe}
      aria-label="Toggle royal gold theme"
      onClick={toggleBrandTheme}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isLuxe
          ? 'border-amber-300/70 bg-amber-400/15 text-amber-200'
          : 'border-white/30 bg-white/40 text-slate-700 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-100'
      } ${className}`}
    >
      <GemIcon className="h-4 w-4" />
      {withLabel ? <span>{mounted && isLuxe ? 'Classic' : 'Royal'}</span> : null}
    </button>
  );
}

export default BrandThemeToggle;