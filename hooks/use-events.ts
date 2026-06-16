import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';
import type { PlatformEvent } from '../services/types';

export function useEvents(params?: { city?: string; upcoming?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.city) qs.set('city', params.city);
  if (params?.upcoming) qs.set('upcoming', 'true');
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery({
    queryKey: ['events', params ?? {}],
    queryFn: () => unwrap(apiGet<PlatformEvent[]>(`/events${suffix}`, false)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => unwrap(apiGet<PlatformEvent>(`/events/${id}`, false)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
