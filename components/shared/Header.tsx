"use client";

import { useEffect, useRef, useState } from 'react';
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
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingRequestsCount = async (baseUrl: string) => {
      try {
        console.log('[Header] Fetching pending requests from:', `${baseUrl}/api/friends/requests`);
        const response = await fetch(`${baseUrl}/api/friends/requests`, {
          credentials: 'include',
        });
        
        console.log('[Header] Response status:', response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Header] Response data:', data);
          if (isMounted) {
            console.log('[Header] Setting pending requests count to:', data.requests.length);
            setPendingRequestsCount(data.requests.length);
          }
        }
      } catch (error) {
        console.error('[Header] Failed to fetch pending requests:', error);
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
          }
        }
      } catch (error) {
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
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
      setCurrentUser(null);
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
        <div className="relative" ref={accountDropdownRef}>
          <button
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 rounded-full bg-primary-50 hover:bg-primary-100 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition relative"
          >
            {currentUser ? (
              <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
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
