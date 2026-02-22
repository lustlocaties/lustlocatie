"use client";

import { useEffect, useState } from 'react';
import { LandingHeader, LandingHeaderMenuItem } from '@/components/landing';
import BrandThemeToggle from '@/components/shared/BrandThemeToggle';
import ThemeSwitch from '@/components/shared/ThemeSwitch';
import Image from 'next/image';

export const Header = ({ className }: { className?: string }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      <LandingHeaderMenuItem href={authHref}>{authLabel}</LandingHeaderMenuItem>
      <LandingHeaderMenuItem type="button" href="/dashboard">
        Dashboard
      </LandingHeaderMenuItem>

      <BrandThemeToggle />
      <ThemeSwitch />
    </LandingHeader>
  );
};

export default Header;
