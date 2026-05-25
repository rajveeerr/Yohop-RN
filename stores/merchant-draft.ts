import { useSyncExternalStore } from 'react';
import {
  merchantStorage,
  type StoredMerchantProfile,
} from '@/services/storage';

export type MerchantCategory = 'restaurant' | 'cafe' | 'retail' | 'other';

export type MerchantDraft = {
  category: MerchantCategory | null;
  businessName: string;
  businessBio: string;
  logoUri: string | null;
  photos: string[];
  address: string;
  websiteUrl: string;
  email: string;
  contactNumber: string;
  services: string;
};

const EMPTY: MerchantDraft = {
  category: null,
  businessName: '',
  businessBio: '',
  logoUri: null,
  photos: [],
  address: '',
  websiteUrl: '',
  email: '',
  contactNumber: '',
  services: '',
};

let state: MerchantDraft = { ...EMPTY };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getMerchantDraft(): MerchantDraft {
  return state;
}

export function setMerchantDraft(patch: Partial<MerchantDraft>) {
  state = { ...state, ...patch };
  emit();
}

export function resetMerchantDraft() {
  state = { ...EMPTY };
  emit();
}

export function useMerchantDraft(): MerchantDraft {
  return useSyncExternalStore(subscribe, getMerchantDraft, getMerchantDraft);
}

export function useStoredMerchantProfile(): StoredMerchantProfile | null {
  return useSyncExternalStore(
    merchantStorage.subscribe,
    merchantStorage.getSync,
    merchantStorage.getSync,
  );
}
