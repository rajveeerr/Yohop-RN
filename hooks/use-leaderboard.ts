import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  MyRank,
} from '../services/types';

export function useLeaderboard(period: LeaderboardPeriod = 'week') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () =>
      unwrap(apiGet<LeaderboardEntry[]>(`/leaderboard/${period}`, false)),
    staleTime: 3 * 60 * 1000,
  });
}

export function useMyRank(period: LeaderboardPeriod = 'week') {
  return useQuery({
    queryKey: ['leaderboard', period, 'me'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      return unwrap(apiGet<MyRank>(`/leaderboard/${period}/me`));
    },
    retry: false,
    staleTime: 3 * 60 * 1000,
  });
}
