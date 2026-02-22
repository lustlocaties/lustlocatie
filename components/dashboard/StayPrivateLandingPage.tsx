import Image from 'next/image';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { FeaturedStays } from '@/components/dashboard/FeaturedStays';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { MetricsMapRow } from '@/components/dashboard/MetricsMapRow';
import { ReviewsPanel } from '@/components/dashboard/ReviewsPanel';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { TrustBadges } from '@/components/dashboard/TrustBadges';
import {
  featuredStays,
  heroBadges,
  navLinks,
  reviewItems,
  trustBadges,
} from '@/data/dashboard/stayPrivateData';

export function StayPrivateLandingPage() {
  return (
    <div className="relative w-full overflow-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/static/images/backdrop-8.webp"
          alt="Luxury hotel background"
          fill
          priority
          className="object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-100/80 to-slate-100/95 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/95" />
      </div>

      <div className="relative z-10 min-h-screen">
        <DashboardNav links={navLinks} />

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:gap-8 lg:px-8">
          <HeroSection badges={heroBadges} />
          <SearchBar />
          <MetricsMapRow />

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-10 lg:gap-8">
            <div className="lg:col-span-7">
              <FeaturedStays stays={featuredStays} />
            </div>
            <div className="lg:col-span-3">
              <ReviewsPanel reviews={reviewItems} />
            </div>
          </section>

          <TrustBadges badges={trustBadges} />
        </div>
      </div>
    </div>
  );
}
