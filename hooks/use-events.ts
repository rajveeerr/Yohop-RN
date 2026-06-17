import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../services/api';
import type { PlatformEvent } from '../services/types';

// /events returns { events: [...] } and /events/:id returns { event: {...} } —
// neither nests under `data`, so unwrap() would hand back the wrapper object
// (which then explodes on .map). Dig the real value out of any shape.
function pickEventList(res: any): PlatformEvent[] {
  const cand = res?.events ?? res?.data?.events ?? res?.data ?? res;
  return Array.isArray(cand) ? (cand as PlatformEvent[]) : [];
}

export function useEvents(params?: { city?: string; upcoming?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.city) qs.set('city', params.city);
  if (params?.upcoming) qs.set('upcoming', 'true');
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery({
    queryKey: ['events', params ?? {}],
    queryFn: async () => pickEventList(await apiGet<unknown>(`/events${suffix}`, false)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const res = (await apiGet<unknown>(`/events/${id}`, false)) as any;
      const event = res?.event ?? res?.data?.event ?? res?.data ?? null;
      if (!event) throw new Error(res?.error || 'Event not found');
      return event as PlatformEvent;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
