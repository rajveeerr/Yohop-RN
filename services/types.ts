// Types align with backend.docx §4 (DB schema) and §6 (API reference).
// Anything marked "SCHEMA UNVERIFIED" lacks an explicit field list in the docs
// and was inferred from endpoint purpose — verify against a live API call.

export type LoyaltyTier =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND';

export type UserRole =
  | 'USER'
  | 'MERCHANT'
  | 'ADMIN'
  | 'EVENT_ORGANIZER'
  | 'SUPER_ADMIN';

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  birthday: string | null;
  role: UserRole;
  points: number;
  monthlyPoints: number;
  coins: number;
  experiencePoints: number;
  loyaltyTier: LoyaltyTier;
  totalSpent: number;
  referralCode: string;
  emailVerified: boolean;
  createdAt: string;
  merchantId?: string | null;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  avatar: string | null;
  points: number;
  rank: number;
};

export type LeaderboardPeriod = 'day' | 'week' | 'month' | 'all-time';

export type MyRank = {
  rank: number;
  points: number;
  total: number;
};

export type ProfileStats = {
  points: number;
  monthlyPoints: number;
  coins: number;
  experiencePoints: number;
  loyaltyTier: LoyaltyTier;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  achievementsUnlocked: number;
};

export type MerchantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// §4.2 Merchant — fields below the divider are documented but may be omitted
// in trimmed response shapes (e.g. nested merchant on Deal/Event responses).
export type Merchant = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  logo: string | null;
  // Live /deals responses return the logo as `logoUrl`; keep both so either shape maps.
  logoUrl?: string | null;
  coverImage: string | null;
  gallery: string[];
  amenities: string[];
  vibeTags: string[];
  // Documented in §4.2 — optional here because list-style responses may omit them.
  userId?: string;
  status?: MerchantStatus;
  zipCode?: string | null;
  phone?: string | null;
  website?: string | null;
  operatingHours?: Record<string, unknown> | null;
};

// §4.3 Deal — fields below the divider are documented but may be omitted in
// list-style responses; surface them as optional so the frontend tolerates both
// the full record and trimmed projections.
export type Deal = {
  id: string;
  merchantId: string;
  merchant?: Pick<Merchant, 'id' | 'businessName' | 'logo' | 'logoUrl' | 'address' | 'city' | 'latitude' | 'longitude'>;
  title: string;
  description: string | null;
  // Live /deals responses return a pre-formatted label (e.g. "20% OFF", "DEAL")
  // and `imageUrl`/`claimedBy` instead of the documented numeric/count fields.
  offerDisplay?: string | null;
  imageUrl?: string | null;
  claimedBy?: { totalCount: number; visibleUsers?: unknown[] } | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  startTime: string | null;
  endTime: string | null;
  images: string[];
  isActive: boolean;
  isBounty: boolean;
  bountyReward: number | null;
  currentRedemptions: number | null;
  maxRedemptions: number | null;
  isFlashSale: boolean;
  viewCount?: number;
  likeCount?: number;
  // Documented in §4.3 — optional because list endpoints often trim these.
  accessCode?: string | null;
  dealTypeId?: string | null;
  dealCategoryId?: string | null;
  isSurprise?: boolean;
  surpriseRadius?: number | null;
};

export type MenuItem = {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image: string | null;
  isAvailable: boolean;
  isHappyHour?: boolean;
  isSurprise?: boolean;
};

export type EventType =
  | 'PARTY'
  | 'BAR_CRAWL'
  | 'SPORTS'
  | 'FESTIVAL'
  | 'RSVP'
  | 'WAGBT';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export type EventTicketTier = {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string | null;
};

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type TableBooking = {
  id: string;
  merchantId: string;
  date: string;
  time?: string | null;
  partySize: number;
  status: BookingStatus;
  confirmationCode: string;
  specialRequests?: string | null;
  merchant?: Pick<Merchant, 'id' | 'businessName' | 'logo'>;
};

export type ServiceBooking = {
  id: string;
  serviceId: string;
  date: string;
  time?: string | null;
  status: BookingStatus;
  confirmationCode: string;
  qrCode?: string | null;
  service?: {
    id: string;
    title: string;
    type?: string | null;
    duration?: number | null;
    merchant?: Pick<Merchant, 'id' | 'businessName' | 'logo'>;
  };
};

export type ActivityItem = {
  id: string;
  kind: 'table' | 'service' | 'event';
  title: string;
  sub: string;
  date: string;
  points: number;
  emoji: string;
};

// §4.4 CheckIn — DB record returned by POST /users/check-in.
export type CheckIn = {
  id: string;
  userId: string;
  merchantId: string;
  latitude: number;
  longitude: number;
  distance: number | null;
  pointsEarned: number;
};

// §4.15 Nudge — template/configuration record.
export type NudgeType =
  | 'INACTIVITY'
  | 'NEARBY_DEAL'
  | 'STREAK'
  | 'HAPPY_HOUR'
  | 'WEATHER'
  | 'SURPRISE';

export type Nudge = {
  id: string;
  type: NudgeType;
  triggerConditions: Record<string, unknown>;
  frequency: string | null;
  cooldown: number | null;
  timeWindow: Record<string, unknown> | null;
};

// §4.15 UserNudge — per-user delivery record.
export type UserNudge = {
  id: string;
  userId: string;
  nudgeId: string;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  dismissedAt: string | null;
};

// SCHEMA UNVERIFIED — GET /nudges response shape.
// The docs spec Nudge as a template (type/triggerConditions/frequency/cooldown/timeWindow)
// and UserNudge as a delivery record (sentAt/deliveredAt/...). Neither contains
// rendered display text. The endpoint likely returns a joined/rendered shape with
// at minimum the type and timestamps; title/body/icon are best-effort and may not
// be present in the real response. Notifications screen falls back to TYPE_LABEL[type]
// if title is absent.
export type RenderedNudge = {
  id: string;
  type: NudgeType;
  title?: string;
  body?: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  createdAt: string;
  dismissedAt?: string | null;
};

export type UserNudgePreferences = {
  userId: string;
  enabledTypes: NudgeType[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
};

// SCHEMA UNVERIFIED — GET /gamification/profile response.
// Docs reference "coins, XP, tier, achievements" in §6.7 but no field list. The
// fields below align with §4.5 (UserStreak / Achievement / CoinTransaction tables)
// plus computed summary numbers the profile endpoint plausibly returns.
export type GamificationProfile = {
  coins: number;
  experiencePoints: number;
  loyaltyTier: LoyaltyTier;
  nextTier?: LoyaltyTier | null;
  nextTierAt?: number | null;
  achievementsUnlocked: number;
  achievementsTotal?: number;
};

// §4.5 Achievement
export type Achievement = {
  id: string;
  name: string;
  type: string;
  description: string;
  criteria: Record<string, unknown>;
  coinReward: number;
  xpReward: number;
};

// SCHEMA UNVERIFIED — §4.5 says "UserAchievement: Tracks user progress" with no
// field list. The endpoint GET /gamification/achievements/progress is expected to
// return one row per achievement with current progress and completion timestamp.
export type UserAchievement = {
  achievementId: string;
  achievement: Achievement;
  progress: number;
  total: number;
  completedAt: string | null;
};

// §4.5 CoinTransaction
export type CoinTransactionType =
  | 'PURCHASE'
  | 'EARNED'
  | 'SPENT'
  | 'BONUS'
  | 'REFUND';

export type CoinTransaction = {
  id: string;
  userId: string;
  type: CoinTransactionType;
  amount: number;
  description: string | null;
  createdAt: string;
};

// SCHEMA UNVERIFIED — §4.5 UserStreak fields are documented; the streak-rewards
// endpoint response shape is not. Field names below are inferred.
export type StreakReward = {
  id: string;
  milestoneDays: number;
  rewardType: 'COINS' | 'DISCOUNT' | 'BADGE' | 'BONUS';
  value: number;
  claimed: boolean;
  claimedAt?: string | null;
};

// SCHEMA UNVERIFIED — §4.11 describes VenueReward narratively as "Location-based
// rewards (coins, discounts, bonuses) with geo-fence radius and max claims" but
// gives no field list. Shape below is inferred from the narrative.
export type VenueRewardType = 'COINS' | 'DISCOUNT' | 'BONUS' | 'FREE_ITEM';

export type VenueReward = {
  id: string;
  name: string;
  description?: string | null;
  type: VenueRewardType;
  amount: number;
  merchantId: string;
  merchant?: Pick<Merchant, 'id' | 'businessName' | 'logo'>;
  latitude: number;
  longitude: number;
  radius: number;
  expiresAt?: string | null;
};

// SCHEMA UNVERIFIED — §4.11 VenueRewardClaim "User claim records with GPS
// verification" — no field list given.
export type VenueRewardClaim = {
  id: string;
  rewardId: string;
  reward?: VenueReward;
  claimedAt: string;
};

// §4.14 PaymentTransaction
export type PaymentStatus = 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export type PaymentPurpose =
  | 'COIN_PURCHASE'
  | 'DEAL'
  | 'EVENT'
  | 'TABLE_BOOKING'
  | 'SERVICE_BOOKING'
  | 'ORDER';

export type PaymentGateway = 'PAYPAL' | 'STRIPE';

export type PaymentTransaction = {
  id: string;
  userId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  coinsPurchased: number | null;
  status: PaymentStatus;
  currency: string;
  gateway: PaymentGateway;
  purpose: PaymentPurpose;
};

// §4.13 Order
export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export type Order = {
  id: string;
  orderNumber: string;
  subtotal: number;
  discount: number;
  finalAmount: number;
  status: OrderStatus;
  items: Record<string, unknown>[];
  paymentMethod: string | null;
};

export type PlatformEvent = {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  startDate: string;
  endDate: string;
  capacity: number | null;
  images?: string[];
  coverImage?: string | null;
  description?: string | null;
  merchant?: Pick<Merchant, 'id' | 'businessName' | 'logo'>;
  ticketTiers?: EventTicketTier[];
};
