import { useQuery } from '@tanstack/react-query';
import { apiGet, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  MyRank,
} from '../services/types';

// Deployed backend returns the whole board (incl. the caller's `me` row) from
// GET /leaderboard?period=<period>, using `periodPoints`/`totalPoints` fields —
// the documented per-period (`/leaderboard/:period`) and per-user
// (`/leaderboard/:period/me`) routes are not registered there.
type BoardRow = {
  userId: number | string;
  name: string;
  avatar?: string | null;
  periodPoints: number;
  totalPoints: number;
  rank: number;
};
type LeaderboardBoard = { top?: BoardRow[]; me?: BoardRow | null };

export function useLeaderboard(period: LeaderboardPeriod = 'week') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      try {
        return await unwrap(apiGet<LeaderboardEntry[]>(`/leaderboard/${period}`, false));
      } catch {
        const board = await unwrap(
          apiGet<LeaderboardBoard>(`/leaderboard?period=${period}`, false),
        );
        return (board.top ?? []).map<LeaderboardEntry>((r) => ({
          userId: String(r.userId),
          name: r.name,
          avatar: r.avatar ?? null,
          points: r.periodPoints,
          rank: r.rank,
        }));
      }
    },
    staleTime: 3 * 60 * 1000,
  });
}

export function useMyRank(period: LeaderboardPeriod = 'week') {
  return useQuery({
    queryKey: ['leaderboard', period, 'me'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      try {
        return await unwrap(apiGet<MyRank>(`/leaderboard/${period}/me`));
      } catch {
        const board = await unwrap(
          apiGet<LeaderboardBoard>(`/leaderboard?period=${period}`),
        );
        const me = board.me;
        return me
          ? { rank: me.rank, points: me.periodPoints, total: me.totalPoints }
          : null;
      }
    },
    retry: false,
    staleTime: 3 * 60 * 1000,
  });
}
