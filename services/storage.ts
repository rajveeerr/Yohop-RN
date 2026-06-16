import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';
const GUEST_KEY = 'guestMode';
const MERCHANT_KEY = 'merchantProfile';

const memory: Record<string, string | undefined> = {};

async function safeGet(key: string): Promise<string | null> {
  if (memory[key] !== undefined) return memory[key] ?? null;
  try {
    const v = await AsyncStorage.getItem(key);
    memory[key] = v ?? undefined;
    return v;
  } catch {
    return memory[key] ?? null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  memory[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // swallow — value lives in memory for this session
  }
}

async function safeRemove(key: string): Promise<void> {
  memory[key] = undefined;
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // swallow
  }
}

export const tokenStorage = {
  get: () => safeGet(TOKEN_KEY),
  set: (token: string) => safeSet(TOKEN_KEY, token),
  clear: () => safeRemove(TOKEN_KEY),
};

const guestSubscribers = new Set<() => void>();
let guestCache: boolean | null = null;

function notifyGuest() {
  guestSubscribers.forEach((fn) => fn());
}

export const guestStorage = {
  async isGuest(): Promise<boolean> {
    if (guestCache !== null) return guestCache;
    const v = (await safeGet(GUEST_KEY)) === '1';
    guestCache = v;
    return v;
  },
  isGuestSync(): boolean {
    return guestCache === true;
  },
  async enable() {
    guestCache = true;
    await safeSet(GUEST_KEY, '1');
    notifyGuest();
  },
  async disable() {
    guestCache = false;
    await safeRemove(GUEST_KEY);
    notifyGuest();
  },
  subscribe(fn: () => void): () => void {
    guestSubscribers.add(fn);
    return () => guestSubscribers.delete(fn);
  },
};

export type StoredMerchantProfile = {
  category: 'restaurant' | 'cafe' | 'retail' | 'other' | null;
  businessName: string;
  businessBio: string;
  logoUri: string | null;
  photos: string[];
  address: string;
  websiteUrl: string;
  email: string;
  contactNumber: string;
  services: string;
  onboardedAt: string;
  amenities?: string[];
  vibeTags?: string[];
};

const merchantSubscribers = new Set<() => void>();
let merchantCache: StoredMerchantProfile | null = null;
let merchantLoaded = false;

function notifyMerchant() {
  merchantSubscribers.forEach((fn) => fn());
}

export const merchantStorage = {
  async load(): Promise<StoredMerchantProfile | null> {
    if (merchantLoaded) return merchantCache;
    const raw = await safeGet(MERCHANT_KEY);
    if (raw) {
      try {
        merchantCache = JSON.parse(raw) as StoredMerchantProfile;
      } catch {
        merchantCache = null;
      }
    }
    merchantLoaded = true;
    notifyMerchant();
    return merchantCache;
  },
  getSync(): StoredMerchantProfile | null {
    return merchantCache;
  },
  isOnboardedSync(): boolean {
    return merchantCache !== null;
  },
  async save(profile: Omit<StoredMerchantProfile, 'onboardedAt'>) {
    const next: StoredMerchantProfile = {
      ...profile,
      onboardedAt: new Date().toISOString(),
    };
    merchantCache = next;
    merchantLoaded = true;
    await safeSet(MERCHANT_KEY, JSON.stringify(next));
    notifyMerchant();
  },
  async clear() {
    merchantCache = null;
    merchantLoaded = true;
    await safeRemove(MERCHANT_KEY);
    notifyMerchant();
  },
  subscribe(fn: () => void): () => void {
    merchantSubscribers.add(fn);
    return () => merchantSubscribers.delete(fn);
  },
};
