import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { StreakReward } from '../services/types';

export type StreakProfile = {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  weeklyCheckIns: number;
  currentDiscount: number;
};

export function useStreakProfile() {
  return useQuery({
    queryKey: ['streak', 'profile'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      return unwrap(apiGet<StreakProfile>('/streak/profile'));
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useStreakRewards() {
  return useQuery({
    queryKey: ['streak', 'rewards'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as StreakReward[];
      return unwrap(apiGet<StreakReward[]>('/streak/rewards'));
    },
    staleTime: 10 * 60 * 1000,
  });
}
