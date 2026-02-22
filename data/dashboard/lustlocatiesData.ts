export type StayTag =
  | 'Discreet Entry'
  | 'City Escape'
  | 'Romantic'
  | 'Spa Access'
  | 'Soundproof';

export type FeaturedStay = {
  id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  privacyScore: number;
  romanceScore: number;
  tags: StayTag[];
};

export type ReviewItem = {
  id: string;
  author: string;
  time: string;
  rating: number;
  text: string;
};

export type TrustBadge = {
  id: string;
  label: string;
};

export const navLinks = ['Discover', 'Map', 'Favorites', 'Blog', 'Support'];

export const stayTags: StayTag[] = [
  'Discreet Entry',
  'City Escape',
  'Romantic',
  'Spa Access',
  'Soundproof',
];

export const countryOptions = ['Netherlands', 'Belgium', 'Germany'];

export const cityOptionsByCountry: Record<string, string[]> = {
  Netherlands: [
    'Amsterdam',
    'Rotterdam',
    'Utrecht',
    'Eindhoven',
    'Breda',
    'Den Haag',
  ],
  Belgium: ['Antwerp'],
  Germany: ['Berlin'],
};

export const featuredStays: FeaturedStay[] = [
  {
    id: 'stay-1',
    name: 'Velvet Harbor Suites',
    city: 'Rotterdam',
    image: '/static/images/1.jpg',
    rating: 4.9,
    privacyScore: 92,
    romanceScore: 88,
    tags: ['Discreet Entry', 'Romantic', 'Soundproof'],
  },
  {
    id: 'stay-2',
    name: 'Nocturne Loft',
    city: 'Utrecht',
    image: '/static/images/2.jpg',
    rating: 4.8,
    privacyScore: 89,
    romanceScore: 91,
    tags: ['City Escape', 'Spa Access', 'Soundproof'],
  },
  {
    id: 'stay-3',
    name: 'Azure Private Residence',
    city: 'Amsterdam',
    image: '/static/images/3.jpg',
    rating: 4.7,
    privacyScore: 94,
    romanceScore: 85,
    tags: ['Discreet Entry', 'City Escape'],
  },
  {
    id: 'stay-4',
    name: 'Moonlight Atrium',
    city: 'Eindhoven',
    image: '/static/images/4.jpg',
    rating: 4.6,
    privacyScore: 86,
    romanceScore: 90,
    tags: ['Romantic', 'Spa Access'],
  },
  {
    id: 'stay-5',
    name: 'Secret Garden Rooms',
    city: 'Breda',
    image: '/static/images/5.jpg',
    rating: 4.8,
    privacyScore: 91,
    romanceScore: 93,
    tags: ['Discreet Entry', 'Romantic'],
  },
  {
    id: 'stay-6',
    name: 'Twilight Canal House',
    city: 'Den Haag',
    image: '/static/images/backdrop-8.webp',
    rating: 4.7,
    privacyScore: 88,
    romanceScore: 87,
    tags: ['City Escape', 'Discreet Entry', 'Soundproof'],
  },
];

export const reviewItems: ReviewItem[] = [
  {
    id: 'review-1',
    author: 'Lotte',
    time: '2h ago',
    rating: 5,
    text: 'Check-in was smooth and private. Perfect place for an evening away.',
  },
  {
    id: 'review-2',
    author: 'Marco',
    time: '8h ago',
    rating: 5,
    text: 'Great location and discreet entrance. Staff handled everything professionally.',
  },
  {
    id: 'review-3',
    author: 'Anouk',
    time: '1d ago',
    rating: 4,
    text: 'Quiet room, clean finish, and the mood lighting made it feel premium.',
  },
  {
    id: 'review-4',
    author: 'Yara',
    time: '2d ago',
    rating: 5,
    text: 'Exactly as listed. Trusted listing and no awkward interactions.',
  },
  {
    id: 'review-5',
    author: 'Ruben',
    time: '3d ago',
    rating: 4,
    text: 'Loved the vibe and privacy score details. Booking flow was very clear.',
  },
];

export const trustBadges: TrustBadge[] = [
  { id: 'badge-1', label: 'Verified' },
  { id: 'badge-2', label: 'Couple Approved' },
  { id: 'badge-3', label: '24/7 Support' },
];
