import type {
  Deal,
  MenuItem,
  PlatformEvent,
  TableBooking,
} from '@/services/types';

export type MerchantStat = {
  label: string;
  value: string;
  icon: string;
  delta: string;
  positive: boolean;
};

export const MERCHANT_BUSINESS = {
  name: 'Neon Nightclub',
  handle: 'neon.delhi',
  city: 'Delhi',
  logoColor: '#C4F27F',
  tier: 'VERIFIED PARTNER',
};

export const MERCHANT_STATS: MerchantStat[] = [
  { label: 'Active Deals', value: '12', icon: 'pricetag-outline', delta: '+3', positive: true },
  { label: 'Bookings / wk', value: '45', icon: 'calendar-outline', delta: '+12%', positive: true },
  { label: 'Revenue', value: '$2,340', icon: 'cash-outline', delta: '+8%', positive: true },
  { label: 'Profile Views', value: '1.2k', icon: 'eye-outline', delta: '+22%', positive: true },
];

export type RecentActivity = {
  id: string;
  type: 'booking' | 'deal' | 'review' | 'redemption';
  title: string;
  sub: string;
  timeAgo: string;
  emoji: string;
};

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  { id: 'a1', type: 'booking', title: 'New booking', sub: 'Aarav · party of 4 · 8:30pm', timeAgo: '2m', emoji: '🪑' },
  { id: 'a2', type: 'redemption', title: 'Deal redeemed', sub: 'Happy Hour 30% Off · ₹420', timeAgo: '14m', emoji: '🎟️' },
  { id: 'a3', type: 'review', title: '5★ review', sub: '"Amazing vibe and music"', timeAgo: '1h', emoji: '⭐' },
  { id: 'a4', type: 'booking', title: 'New booking', sub: 'Riya · party of 2 · 10:00pm', timeAgo: '2h', emoji: '🪑' },
  { id: 'a5', type: 'deal', title: 'Deal activated', sub: 'Weekend Brunch BOGO', timeAgo: '5h', emoji: '🔥' },
];

export const MOCK_DEALS: Deal[] = [
  {
    id: 'd1',
    merchantId: 'm1',
    title: 'Happy Hour 30% Off',
    description: 'Every weekday 5–8pm on cocktails and bar bites.',
    discountPercentage: 30,
    discountAmount: null,
    startTime: '2026-05-25T17:00:00Z',
    endTime: '2026-12-31T23:00:00Z',
    images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80'],
    isActive: true,
    isBounty: false,
    bountyReward: null,
    isFlashSale: false,
    currentRedemptions: 84,
    maxRedemptions: 500,
    viewCount: 1240,
    likeCount: 213,
  },
  {
    id: 'd2',
    merchantId: 'm1',
    title: 'Weekend Brunch BOGO',
    description: 'Buy one brunch plate, get one free. Saturdays & Sundays 11am–3pm.',
    discountPercentage: 50,
    discountAmount: null,
    startTime: '2026-05-25T11:00:00Z',
    endTime: '2026-09-01T15:00:00Z',
    images: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80'],
    isActive: true,
    isBounty: false,
    bountyReward: null,
    isFlashSale: false,
    currentRedemptions: 32,
    maxRedemptions: 200,
    viewCount: 540,
    likeCount: 96,
  },
  {
    id: 'd3',
    merchantId: 'm1',
    title: 'Flash: ₹200 Off Pizza',
    description: 'Today only — Truffle and Wagyu pies. Walk-ins after 10pm.',
    discountPercentage: null,
    discountAmount: 200,
    startTime: '2026-05-25T22:00:00Z',
    endTime: '2026-05-26T02:00:00Z',
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80'],
    isActive: true,
    isBounty: false,
    bountyReward: null,
    isFlashSale: true,
    currentRedemptions: 11,
    maxRedemptions: 50,
    viewCount: 188,
    likeCount: 41,
  },
  {
    id: 'd4',
    merchantId: 'm1',
    title: 'Loyalty Coffee Stamp',
    description: 'Earn a free coffee every 7th visit. Stack with member perks.',
    discountPercentage: 100,
    discountAmount: null,
    startTime: null,
    endTime: null,
    images: ['https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=600&q=80'],
    isActive: false,
    isBounty: true,
    bountyReward: 200,
    isFlashSale: false,
    currentRedemptions: 230,
    maxRedemptions: null,
    viewCount: 2100,
    likeCount: 410,
  },
];

export const MOCK_EVENTS: PlatformEvent[] = [
  {
    id: 'e1',
    title: 'Live Jazz Friday',
    type: 'PARTY',
    status: 'PUBLISHED',
    venue: 'Neon Nightclub',
    address: 'Hauz Khas Village',
    city: 'Delhi',
    state: 'DL',
    latitude: null,
    longitude: null,
    startDate: '2026-05-29T20:00:00Z',
    endDate: '2026-05-29T23:30:00Z',
    capacity: 120,
    images: ['https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80'],
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    description: 'Live jazz quartet, signature cocktails, dim lights.',
  },
  {
    id: 'e2',
    title: 'Wine Tasting Soirée',
    type: 'RSVP',
    status: 'PUBLISHED',
    venue: 'Neon Nightclub',
    address: 'Hauz Khas Village',
    city: 'Delhi',
    state: 'DL',
    latitude: null,
    longitude: null,
    startDate: '2026-06-05T19:00:00Z',
    endDate: '2026-06-05T22:00:00Z',
    capacity: 40,
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'],
    coverImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    description: 'Eight curated pours. Charcuterie included.',
  },
  {
    id: 'e3',
    title: 'DJ Night — Bass Drop',
    type: 'PARTY',
    status: 'DRAFT',
    venue: 'Neon Nightclub',
    address: 'Hauz Khas Village',
    city: 'Delhi',
    state: 'DL',
    latitude: null,
    longitude: null,
    startDate: '2026-06-12T22:00:00Z',
    endDate: '2026-06-13T03:00:00Z',
    capacity: 300,
    images: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80'],
    coverImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    description: 'Bass-heavy set. Guest DJs from Berlin and Mumbai.',
  },
];

export const MOCK_BOOKINGS: TableBooking[] = [
  {
    id: 'b1',
    merchantId: 'm1',
    date: '2026-05-25',
    time: '20:30',
    partySize: 4,
    status: 'PENDING',
    confirmationCode: 'NX-A104',
    specialRequests: 'Window seat please',
  },
  {
    id: 'b2',
    merchantId: 'm1',
    date: '2026-05-25',
    time: '22:00',
    partySize: 2,
    status: 'CONFIRMED',
    confirmationCode: 'NX-A105',
    specialRequests: null,
  },
  {
    id: 'b3',
    merchantId: 'm1',
    date: '2026-05-26',
    time: '19:00',
    partySize: 6,
    status: 'CONFIRMED',
    confirmationCode: 'NX-A106',
    specialRequests: 'Birthday — pls bring candle',
  },
  {
    id: 'b4',
    merchantId: 'm1',
    date: '2026-05-24',
    time: '21:00',
    partySize: 3,
    status: 'COMPLETED',
    confirmationCode: 'NX-A101',
    specialRequests: null,
  },
  {
    id: 'b5',
    merchantId: 'm1',
    date: '2026-05-23',
    time: '20:00',
    partySize: 2,
    status: 'CANCELLED',
    confirmationCode: 'NX-A099',
    specialRequests: null,
  },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 'mi1',
    merchantId: 'm1',
    name: 'Truffle Pasta',
    description: 'Hand-rolled tagliatelle, black truffle, parmesan cream.',
    price: 890,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80',
    isAvailable: true,
    isHappyHour: false,
    isSurprise: false,
  },
  {
    id: 'mi2',
    merchantId: 'm1',
    name: 'Wagyu Burger',
    description: 'A5 wagyu, smoked gouda, brioche bun.',
    price: 1290,
    category: 'Mains',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    isAvailable: true,
    isHappyHour: false,
    isSurprise: false,
  },
  {
    id: 'mi3',
    merchantId: 'm1',
    name: 'Caesar Salad',
    description: 'Crisp romaine, anchovy dressing, garlic croutons.',
    price: 480,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80',
    isAvailable: true,
    isHappyHour: false,
    isSurprise: false,
  },
  {
    id: 'mi4',
    merchantId: 'm1',
    name: 'Tiramisu',
    description: 'Classic, mascarpone, espresso-soaked ladyfingers.',
    price: 380,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
    isAvailable: true,
    isHappyHour: false,
    isSurprise: false,
  },
  {
    id: 'mi5',
    merchantId: 'm1',
    name: 'Old Fashioned',
    description: 'Bourbon, demerara, orange bitters.',
    price: 550,
    category: 'Cocktails',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80',
    isAvailable: true,
    isHappyHour: true,
    isSurprise: false,
  },
  {
    id: 'mi6',
    merchantId: 'm1',
    name: 'Surprise Tasting',
    description: 'Chef picks 4 small plates. Trust us.',
    price: 1490,
    category: 'Tasting',
    image: 'https://images.unsplash.com/photo-1572448862527-d3c904757de6?w=600&q=80',
    isAvailable: true,
    isHappyHour: false,
    isSurprise: true,
  },
];

export type AnalyticsPoint = { label: string; value: number };

export const MOCK_ANALYTICS_VIEWS: AnalyticsPoint[] = [
  { label: 'Mon', value: 120 },
  { label: 'Tue', value: 180 },
  { label: 'Wed', value: 160 },
  { label: 'Thu', value: 240 },
  { label: 'Fri', value: 360 },
  { label: 'Sat', value: 410 },
  { label: 'Sun', value: 290 },
];

export const MOCK_ANALYTICS_KPIS = [
  { label: 'Avg. spend', value: '₹1,820' },
  { label: 'Repeat rate', value: '38%' },
  { label: 'Conv. rate', value: '4.2%' },
  { label: 'Top deal CTR', value: '11.6%' },
];
