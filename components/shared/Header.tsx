"use client";

import { useEffect, useState } from 'react';
import { LandingHeader, LandingHeaderMenuItem } from '@/components/landing';
import BrandThemeToggle from '@/components/shared/BrandThemeToggle';
import ThemeSwitch from '@/components/shared/ThemeSwitch';
import Image from 'next/image';
import { UserIcon, LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Header = ({ className }: { className?: string }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

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
      } catch (error) {
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

  const authHref = isAuthenticated ? '/dashboard' : '/auth';
  const authLabel = isAuthenticated ? 'My account' : 'Inloggen';

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
      setAccountDropdownOpen(false);
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <LandingHeader
      className={className}
      fixed
      withBackground
      variant="primary"
      logoComponent={
        <div className="flex items-center text-primary-500 dark:text-primary-500 gap-3">
          <Image
            src="/static/images/logo.png"
            alt="Lustlocaties logo"
            width={200}
            height={200}
            className="h-8 w-8 rounded-full"
          />
          <span className="font-bold text-lg">Lustlocaties</span>
        </div>
      }
    >
      <LandingHeaderMenuItem href="/features">
        {'Features'}
      </LandingHeaderMenuItem>
      <LandingHeaderMenuItem href="/pricing">{'Pricing'}</LandingHeaderMenuItem>
      <LandingHeaderMenuItem href="/security">
        {'Security'}
      </LandingHeaderMenuItem>
      <LandingHeaderMenuItem href="/help">{'Help'}</LandingHeaderMenuItem>

      {isAuthenticated ? (
        <div className="relative">
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 rounded-full bg-primary-50 hover:bg-primary-100 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            <UserIcon className="h-4 w-4" />
            My account
          </button>

          {accountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/30 bg-white/95 shadow-lg backdrop-blur-sm dark:border-slate-200/10 dark:bg-slate-900/95 z-50">
              <Link
                href="/dashboard"
                onClick={() => setAccountDropdownOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 dark:text-slate-200 dark:hover:bg-slate-800 rounded-t-xl"
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
        <LandingHeaderMenuItem href={authHref}>{authLabel}</LandingHeaderMenuItem>
      )}
      
      <LandingHeaderMenuItem type="button" href="/dashboard">
        Dashboard
      </LandingHeaderMenuItem>

      <BrandThemeToggle />
      <ThemeSwitch />
    </LandingHeader>
  );
};

export default Header;
