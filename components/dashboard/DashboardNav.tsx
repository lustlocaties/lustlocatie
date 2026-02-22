"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedSection, setSelectedSection] = useState('discover');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingRequestsCount = async (baseUrl: string) => {
      try {
        console.log('[DashboardNav] Fetching pending requests from:', `${baseUrl}/api/friends/requests`);
        const response = await fetch(`${baseUrl}/api/friends/requests`, {
          credentials: 'include',
        });
        
        console.log('[DashboardNav] Response status:', response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[DashboardNav] Response data:', data);
          if (isMounted) {
            console.log('[DashboardNav] Setting pending requests count to:', data.requests.length);
            setPendingRequestsCount(data.requests.length);
          }
        }
      } catch (error) {
        console.error('[DashboardNav] Failed to fetch pending requests:', error);
      }
    };

    const fetchUnreadMessagesCount = async (baseUrl: string) => {
      try {
        const response = await fetch(`${baseUrl}/api/messages/unread`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setUnreadMessagesCount(data.unreadCount || 0);
          }
        }
      } catch (error) {
        console.error('[DashboardNav] Failed to fetch unread messages:', error);
      }
    };

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
          
          // If authenticated, fetch user data and pending requests count
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setCurrentUser({
                name: data.user.name,
                email: data.user.email,
              });
            }
            fetchPendingRequestsCount(baseUrl);
            fetchUnreadMessagesCount(baseUrl);
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    };

    checkSession();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      fetchPendingRequestsCount(baseUrl);
      fetchUnreadMessagesCount(baseUrl);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (pathname === dashboardPath) {
      const section = searchParams.get('section');
      setSelectedSection(section ?? 'profile');
      return;
    }

    if (pathname !== workInProgressPath) {
      setSelectedSection('discover');
      return;
    }

    const section = searchParams.get('section');
    setSelectedSection(section ?? 'discover');
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    if (accountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountDropdownOpen]);

  const workInProgressPath = '/work-in-progress';
  const dashboardPath = '/';
  const accountHref = isAuthenticated ? dashboardPath : '/login';
  const accountLabel = isAuthenticated ? 'My account' : 'Sign in';

  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

  const getLinkHref = (link: string) => {
    if (normalize(link) === 'discover') {
      return dashboardPath;
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

    if (normalize(link) === 'discover') {
      return pathname === dashboardPath;
    }

    if (pathname === workInProgressPath) {
      return normalize(link) === selectedSection;
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
      setCurrentUser(null);
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
        <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
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
            <div className="relative hidden md:block" ref={accountDropdownRef}>
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 inline-flex relative"
              >
                {currentUser ? (
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
                My account
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold shadow-lg">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/30 bg-white/95 shadow-lg backdrop-blur-sm dark:border-slate-200/10 dark:bg-slate-900/95 z-50">
                  {currentUser && (
                    <div className="px-4 py-3 border-b border-white/20 dark:border-slate-200/10 bg-slate-50/50 dark:bg-slate-800/50">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard?section=messages"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="relative block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800 border-t border-white/20 dark:border-slate-200/10"
                  >
                    Messages
                    {unreadMessagesCount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/contacts"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800 border-t border-white/20 dark:border-slate-200/10 relative"
                  >
                    Contacts
                    {pendingRequestsCount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">
                        {pendingRequestsCount}
                      </span>
                    )}
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
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard?section=messages"
                  onClick={() => setOpen(false)}
                  className="relative block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Messages
                  {unreadMessagesCount > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold">
                      {unreadMessagesCount}
                    </span>
                  )}
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
