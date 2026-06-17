import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { Deal } from '../services/types';

function normalizeDealList(payload: unknown): Deal[] {
  if (Array.isArray(payload)) return payload as Deal[];
  if (!payload || typeof payload !== 'object') return [];

  const candidate =
    (payload as { deals?: unknown }).deals ??
    (payload as { savedDeals?: unknown }).savedDeals ??
    (payload as { items?: unknown }).items ??
    (payload as { results?: unknown }).results ??
    (payload as { data?: unknown }).data;

  return Array.isArray(candidate) ? (candidate as Deal[]) : [];
}

export function useDeals(params?: {
  isActive?: boolean;
  isFlashSale?: boolean;
  isBounty?: boolean;
  category?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
  if (params?.isFlashSale) qs.set('isFlashSale', 'true');
  if (params?.isBounty) qs.set('isBounty', 'true');
  if (params?.category) qs.set('category', params.category);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery({
    queryKey: ['deals', params ?? {}],
    queryFn: async () => normalizeDealList(await unwrap(apiGet<unknown>(`/deals${suffix}`, false))),
    staleTime: 5 * 60 * 1000,
  });
}

/** Great-circle distance in km between two lat/lng points (Haversine). */
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Sort deals nearest-first relative to the given origin (no merchant coords sink last). */
function sortByDistance(deals: Deal[], lat: number, lng: number): Deal[] {
  return [...deals].sort((a, b) => {
    const da =
      a.merchant?.latitude != null && a.merchant?.longitude != null
        ? distanceKm(lat, lng, a.merchant.latitude, a.merchant.longitude)
        : Number.POSITIVE_INFINITY;
    const db =
      b.merchant?.latitude != null && b.merchant?.longitude != null
        ? distanceKm(lat, lng, b.merchant.latitude, b.merchant.longitude)
        : Number.POSITIVE_INFINITY;
    return da - db;
  });
}

export function useNearbyDeals(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}) {
  const qs = new URLSearchParams({
    lat: String(params.latitude),
    lng: String(params.longitude),
  });
  if (params.radius) qs.set('radius', String(params.radius));
  return useQuery({
    queryKey: ['deals', 'nearby', params],
    // The documented `/deals/nearby` route is currently shadowed by `/deals/:id`
    // on the deployed backend (returns "Invalid Deal ID"). Try it first so this
    // self-heals when the backend is fixed, then fall back to `/deals` + a
    // client-side Haversine sort so the feed still populates nearest-first.
    queryFn: async () => {
      try {
        const nearby = normalizeDealList(
          await unwrap(apiGet<unknown>(`/deals/nearby?${qs.toString()}`, false)),
        );
        return nearby;
      } catch {
        const all = normalizeDealList(await unwrap(apiGet<unknown>('/deals', false)));
        return sortByDistance(all, params.latitude, params.longitude);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ['deals', id],
    // GET /deals/:id returns { success, deal, metadata } — the deal is under the
    // `deal` key (not `data`), so unwrap() would yield undefined. Read it directly
    // and throw on miss so the query surfaces an error instead of `undefined`.
    queryFn: async () => {
      const res = (await apiGet<unknown>(`/deals/${id}`, false)) as any;
      const deal = res?.deal ?? res?.data ?? null;
      if (!deal) throw new Error(res?.error || 'Deal not found');
      // Detail payload nests the merchant; surface merchantId for the
      // merchant/menu queries on the deal screen.
      if (deal.merchantId == null && deal.merchant?.id != null) {
        deal.merchantId = String(deal.merchant.id);
      }
      return deal as Deal;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSavedDeals() {
  return useQuery({
    queryKey: ['users', 'saved-deals'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [];
      return normalizeDealList(await unwrap(apiGet<unknown>('/users/saved-deals')));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleSavedDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) =>
      unwrap(apiPost<{ saved: boolean }>('/users/save-deal', { dealId })),
    onMutate: async (dealId) => {
      await qc.cancelQueries({ queryKey: ['users', 'saved-deals'] });
      const prev = qc.getQueryData<Deal[]>(['users', 'saved-deals']);
      qc.setQueryData(['users', 'saved-deals'], (old: Deal[] = []) =>
        old.some((d) => d.id === dealId)
          ? old.filter((d) => d.id !== dealId)
          : [...old, { id: dealId } as Deal],
      );
      return { prev };
    },
    onError: (_err, _id, ctx: any) =>
      qc.setQueryData(['users', 'saved-deals'], ctx?.prev),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ['users', 'saved-deals'] }),
  });
}
