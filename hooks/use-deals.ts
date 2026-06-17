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
    queryFn: async () =>
      normalizeDealList(
        await unwrap(apiGet<unknown>(`/deals/nearby?${qs.toString()}`, false)),
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => unwrap(apiGet<Deal>(`/deals/${id}`, false)),
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
