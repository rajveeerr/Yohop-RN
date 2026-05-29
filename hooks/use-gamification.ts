import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type {
  Achievement,
  CoinTransaction,
  GamificationProfile,
  UserAchievement,
} from '../services/types';

export function useGamificationProfile() {
  return useQuery({
    queryKey: ['gamification', 'profile'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      return unwrap(apiGet<GamificationProfile>('/gamification/profile'));
    },
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ['gamification', 'achievements'],
    queryFn: () => unwrap(apiGet<Achievement[]>('/gamification/achievements')),
  });
}

export function useAchievementProgress() {
  return useQuery({
    queryKey: ['gamification', 'achievements', 'progress'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as UserAchievement[];
      return unwrap(
        apiGet<UserAchievement[]>('/gamification/achievements/progress'),
      );
    },
  });
}

export function useCoinTransactions() {
  return useQuery({
    queryKey: ['gamification', 'transactions'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as CoinTransaction[];
      return unwrap(apiGet<CoinTransaction[]>('/gamification/transactions'));
    },
  });
}
