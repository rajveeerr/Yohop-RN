import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { CheckIn } from '../services/types';

// SCHEMA UNVERIFIED — §4.4 CheckIn record is documented (id/userId/merchantId/
// latitude/longitude/distance/pointsEarned). The POST /users/check-in endpoint
// likely returns this record possibly extended with computed streak info; the
// optional fields below cover the UI's needs but have no docs guarantee.
export type CheckInResult = CheckIn & {
  streakDays?: number;
  message?: string;
};

export type CheckInHistoryItem = CheckIn & {
  merchantName?: string;
  createdAt: string;
};

// SCHEMA UNVERIFIED — §6.2 lists GET /users/check-in-stats without a response
// shape. Field names below are inferred from typical use.
export type CheckInStats = {
  totalCheckIns: number;
  uniqueVenues: number;
  pointsFromCheckIns: number;
};

export function useUserCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      merchantId: string;
      latitude: number;
      longitude: number;
    }) => unwrap(apiPost<CheckInResult>('/users/check-in', payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'check-in-history'] });
      qc.invalidateQueries({ queryKey: ['users', 'check-in-stats'] });
      qc.invalidateQueries({ queryKey: ['profile', 'stats'] });
      qc.invalidateQueries({ queryKey: ['streak'] });
    },
  });
}

export function useEventCheckIn(eventId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { latitude?: number; longitude?: number; qrCode?: string }) =>
      unwrap(apiPost<CheckInResult>(`/events/${eventId}/checkin`, payload ?? {})),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', eventId] });
      qc.invalidateQueries({ queryKey: ['bookings', 'services'] });
    },
  });
}

export function useCheckInHistory() {
  return useQuery({
    queryKey: ['users', 'check-in-history'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as CheckInHistoryItem[];
      return unwrap(apiGet<CheckInHistoryItem[]>('/users/check-in-history'));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCheckInStats() {
  return useQuery({
    queryKey: ['users', 'check-in-stats'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      return unwrap(apiGet<CheckInStats>('/users/check-in-stats'));
    },
    staleTime: 5 * 60 * 1000,
  });
}
