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
  activeDeals?: number;
};

// Shape returned by the deployed GET /merchants/dashboard/stats endpoint.
// (Auth-based: resolves the merchant from the bearer token, no id in the path.)
type DashboardStatsResponse = {
  period?: string;
  kpis?: {
    grossSales?: number;
    orderVolume?: number;
    averageOrderValue?: number;
    totalKickbackHandout?: number;
  };
  metrics?: {
    activeDeals?: number;
    totalSavedDeals?: number;
    totalKickbackEvents?: number;
  };
};

function mapDashboardStats(res: DashboardStatsResponse): MerchantStats {
  const kpis = res.kpis ?? {};
  const metrics = res.metrics ?? {};
  const orderVolume = kpis.orderVolume ?? 0;
  const savedDeals = metrics.totalSavedDeals ?? 0;
  // Conversion proxy: orders (check-ins) over total saved-deal intents.
  const conversionRate = savedDeals > 0 ? orderVolume / savedDeals : 0;
  return {
    totalRevenue: kpis.grossSales ?? 0,
    totalCheckIns: orderVolume,
    // No group-size signal from this endpoint; surface 0 so the UI shows a
    // neutral placeholder rather than a fabricated figure.
    avgGroupSize: 0,
    conversionRate,
    activeDeals: metrics.activeDeals ?? 0,
  };
}

// `merchantId` is only used to gate the query to merchant users; the backend
// endpoint itself resolves the merchant from the auth token.
export function useMerchantStats(merchantId: string | undefined) {
  return useQuery({
    queryKey: ['merchants', merchantId, 'dashboard-stats'],
    queryFn: async () =>
      mapDashboardStats(
        await unwrap(
          apiGet<DashboardStatsResponse>('/merchants/dashboard/stats'),
        ),
      ),
    enabled: !!merchantId,
    staleTime: 3 * 60 * 1000,
    retry: false,
  });
}
