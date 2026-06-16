import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';

export type MerchantStatsWeeklyBucket = { day: string; value: number };

export type MerchantStats = {
  totalRevenue: number;
  revenueDeltaPct?: number;
  totalCheckIns: number;
  checkInsDeltaPct?: number;
  avgGroupSize: number;
  avgGroupDelta?: number;
  conversionRate: number;
  conversionDeltaPct?: number;
  weeklyCheckIns?: MerchantStatsWeeklyBucket[];
  weeklyRevenue?: MerchantStatsWeeklyBucket[];
  weeklyViews?: MerchantStatsWeeklyBucket[];
  liveCrowd?: number;
  liveDealTitle?: string | null;
};

export function useMerchantStats(merchantId: string | undefined) {
  return useQuery({
    queryKey: ['merchants', merchantId, 'stats'],
    queryFn: () =>
      unwrap(apiGet<MerchantStats>(`/merchants/${merchantId}/stats`)),
    enabled: !!merchantId,
    staleTime: 3 * 60 * 1000,
  });
}
