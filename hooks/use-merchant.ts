import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';
import type { MenuItem, Merchant } from '../services/types';

export function useMerchant(id: string | undefined) {
  return useQuery({
    queryKey: ['merchants', id],
    queryFn: () => unwrap(apiGet<Merchant>(`/merchants/${id}`, false)),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMerchantMenu(id: string | undefined) {
  return useQuery({
    queryKey: ['merchants', id, 'menu-items'],
    queryFn: () => unwrap(apiGet<MenuItem[]>(`/merchants/${id}/menu-items`)),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}
