"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import BrandThemeToggle from '@/components/shared/BrandThemeToggle';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';

type DashboardNavProps = {
  links: string[];
};

export function DashboardNav({ links }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedSection, setSelectedSection] = useState('discover');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (isMounted) {
          setIsAuthenticated(response.ok);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (pathname !== '/work-in-progress') {
      setSelectedSection('discover');
      return;
    }

    const section = new URLSearchParams(window.location.search).get('section');
    setSelectedSection(section ?? 'discover');
  }, [pathname]);

  const workInProgressPath = '/work-in-progress';
  const accountHref = isAuthenticated ? '/dashboard' : '/login';
  const accountLabel = isAuthenticated ? 'My account' : 'Sign in';

  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

  const getLinkHref = (link: string) => {
    if (normalize(link) === 'discover') {
      return '/dashboard';
    }

    if (link === 'Blog') {
      return '/blog';
    }

    return `${workInProgressPath}?section=${normalize(link)}`;
  };

  const isLinkActive = (link: string) => {
    if (link === 'Blog') {
      return pathname === '/blog';
    }

    if (pathname === workInProgressPath) {
      return normalize(link) === selectedSection;
    }

    if (pathname === '/' || pathname === '/dashboard') {
      return normalize(link) === 'discover';
    }

    return false;
  };

  const onLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setOpen(false);
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="ll-dashboard-nav sticky top-0 z-50 w-full border-b border-white/20 bg-white/90 transition-colors dark:border-slate-200/10 dark:bg-slate-950/85">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl p-1">
            <Image
              src="/static/images/logo.png"
              alt="Lustlocaties logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Lustlocaties
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discreet stays</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link}
              href={getLinkHref(link)}
              className={`text-sm font-medium transition-colors duration-300 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-offset-slate-950 ${
                isLinkActive(link)
                  ? 'text-primary-500 underline decoration-primary-500 underline-offset-8'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={workInProgressPath}
            aria-label="Quick search"
            className="hidden h-11 items-center justify-center rounded-full border border-white/30 bg-white/40 px-4 text-slate-700 transition hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-200 md:flex"
          >
            <SearchIcon className="h-4 w-4" />
          </Link>

          <BrandThemeToggle className="hidden md:inline-flex" />

          <div className="rounded-full border border-white/30 bg-white/40 p-2 text-slate-700 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-100">
            <ThemeSwitch />
          </div>

          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 inline-flex"
              >
                <UserIcon className="h-4 w-4" />
                My account
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/30 bg-white/95 shadow-lg backdrop-blur-sm dark:border-slate-200/10 dark:bg-slate-900/95 z-50">
                  <Link
                    href="/dashboard"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800 rounded-t-xl first:rounded-t-xl"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard?section=messages"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800 border-t border-white/20 dark:border-slate-200/10"
                  >
                    Messages
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      onLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 dark:text-slate-200 dark:hover:bg-red-900/20 border-t border-white/20 dark:border-slate-200/10 rounded-b-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={accountHref}
              className="hidden h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:inline-flex"
            >
              <UserIcon className="h-4 w-4" />
              {accountLabel}
            </Link>
          )}

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/40 text-slate-700 transition hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-100 md:hidden"
          >
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/20 px-4 pb-4 md:hidden dark:border-slate-200/10">
          <div className="space-y-3 rounded-2xl border border-white/25 bg-white/60 p-4 backdrop-blur-sm dark:border-slate-200/10 dark:bg-slate-900/70">
            <BrandThemeToggle className="w-full" />

            {links.map((link) => (
              <Link
                key={link}
                href={getLinkHref(link)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {link}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard?section=messages"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Messages
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  disabled={isLoggingOut}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/40 px-4 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-200/10 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  <LogOutIcon className="h-4 w-4" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <Link
                href={accountHref}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <UserIcon className="h-4 w-4" />
                {accountLabel}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
