'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { ContactCard } from '@/components/dashboard/ContactCard';
import { FindContactsCard } from '@/components/dashboard/FindContactsCard';

const navLinks = ['Discover', 'Blog'];

function ContactsContent() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/auth?tab=login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        router.push('/auth?tab=login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <DashboardNav links={navLinks} />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="w-[100vw]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
            <FindContactsCard onFriendAdded={() => setRefreshKey(k => k + 1)} />
            <ContactCard key={refreshKey} />
          </div>
        </div>
      </main>
    </>
  );
}

export default function ContactsPageRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <ContactsContent />
    </Suspense>
  );
}
