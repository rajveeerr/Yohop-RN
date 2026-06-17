import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut, unwrap } from '../services/api';
import type { Deal, MenuItem, Merchant } from '../services/types';

// Matches the backend POST /merchants/register contract (additive fields are
// optional). `businessCategory` is resolved server-side against the category
// master list; `stores` can be added later from the dashboard.
export type MerchantRegisterInput = {
  businessName: string;
  description?: string | null;
  businessCategory?: string;
  address?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  logoUrl?: string | null;
  galleryUrls?: string[];
};

export function useCreateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MerchantRegisterInput) =>
      unwrap(
        apiPost<{ message: string; merchant: Merchant }>(
          '/merchants/register',
          payload,
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      qc.invalidateQueries({ queryKey: ['merchant', 'status'] });
    },
  });
}

export function useUpdateMerchant(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Merchant>) =>
      unwrap(apiPut<Merchant>(`/merchants/${merchantId}`, payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchants', merchantId] });
    },
  });
}

export function useMerchantDealsList(merchantId: string | undefined) {
  return useQuery({
    queryKey: ['merchants', merchantId, 'deals'],
    queryFn: () =>
      unwrap(apiGet<Deal[]>(`/merchants/${merchantId}/deals`)),
    enabled: !!merchantId,
  });
}

export function useCreateMerchantDeal(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Deal>) =>
      unwrap(apiPost<Deal>(`/merchants/${merchantId}/deals`, payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchants', merchantId, 'deals'] });
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateMerchantDeal(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { dealId: string } & Partial<Deal>) => {
      const { dealId, ...body } = payload;
      return unwrap(
        apiPut<Deal>(`/merchants/${merchantId}/deals/${dealId}`, body),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchants', merchantId, 'deals'] });
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDeleteMerchantDeal(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dealId: string) =>
      unwrap(
        apiDelete<{ deleted: boolean }>(
          `/merchants/${merchantId}/deals/${dealId}`,
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchants', merchantId, 'deals'] });
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useCreateMenuItem(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MenuItem>) =>
      unwrap(
        apiPost<MenuItem>(`/merchants/${merchantId}/menu-items`, payload),
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['merchants', merchantId, 'menu-items'],
      });
    },
  });
}

export function useUpdateMenuItem(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { itemId: string } & Partial<MenuItem>) => {
      const { itemId, ...body } = payload;
      return unwrap(
        apiPut<MenuItem>(
          `/merchants/${merchantId}/menu-items/${itemId}`,
          body,
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['merchants', merchantId, 'menu-items'],
      });
    },
  });
}

export function useDeleteMenuItem(merchantId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      unwrap(
        apiDelete<{ deleted: boolean }>(
          `/merchants/${merchantId}/menu-items/${itemId}`,
        ),
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['merchants', merchantId, 'menu-items'],
      });
    },
  });
}
