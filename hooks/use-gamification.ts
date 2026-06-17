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
    staleTime: 5 * 60 * 1000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ['gamification', 'achievements'],
    queryFn: () => unwrap(apiGet<Achievement[]>('/gamification/achievements')),
    staleTime: 5 * 60 * 1000,
  });
}

// Deployed backend embeds per-user progress inside each /gamification/achievements
// row (`userProgress: { isCompleted, completedAt }`) instead of exposing the
// documented /gamification/achievements/progress route.
type AchievementWithProgress = Achievement & {
  userProgress?: { isCompleted?: boolean; completedAt?: string | null } | null;
};

export function useAchievementProgress() {
  return useQuery({
    queryKey: ['gamification', 'achievements', 'progress'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as UserAchievement[];
      try {
        return await unwrap(
          apiGet<UserAchievement[]>('/gamification/achievements/progress'),
        );
      } catch {
        const list = await unwrap(
          apiGet<AchievementWithProgress[]>('/gamification/achievements'),
        );
        return list.map<UserAchievement>((a) => ({
          achievementId: String(a.id),
          achievement: {
            id: String(a.id),
            name: a.name,
            type: a.type,
            description: a.description,
            criteria: a.criteria ?? {},
            coinReward: a.coinReward ?? 0,
            xpReward: a.xpReward ?? 0,
          },
          progress: a.userProgress?.isCompleted ? 1 : 0,
          total: 1,
          completedAt: a.userProgress?.completedAt ?? null,
        }));
      }
    },
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
  });
}
