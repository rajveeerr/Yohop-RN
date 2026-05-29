import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { VenueReward, VenueRewardClaim } from '../services/types';

export function useNearbyVenueRewards(params?: {
  latitude?: number;
  longitude?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.latitude !== undefined) qs.set('lat', String(params.latitude));
  if (params?.longitude !== undefined) qs.set('lng', String(params.longitude));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery({
    queryKey: ['venue-rewards', 'nearby', params ?? {}],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as VenueReward[];
      return unwrap(apiGet<VenueReward[]>(`/venue-rewards/nearby${suffix}`));
    },
  });
}

export function useMyVenueClaims() {
  return useQuery({
    queryKey: ['venue-rewards', 'my-claims'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as VenueRewardClaim[];
      return unwrap(apiGet<VenueRewardClaim[]>('/venue-rewards/my-claims'));
    },
  });
}

export function useClaimVenueReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) =>
      unwrap(apiPost<VenueRewardClaim>(`/venue-rewards/${rewardId}/claim`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venue-rewards'] });
    },
  });
}
