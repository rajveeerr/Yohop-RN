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
  userId?: number | string;
  id?: number | string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  periodPoints?: number;
  totalPoints?: number;
  points?: number;
  rank: number;
};
type LeaderboardBoard = { top?: BoardRow[]; me?: BoardRow | null };

// The leaderboard endpoint comes back in two shapes depending on the route:
// a bare LeaderboardEntry[] (documented) OR the full board object { top, me }
// (what GET /leaderboard and GET /leaderboard/:period actually return). Normalize
// both to LeaderboardEntry[] so consumers can always `.map`/`.slice`.
function toEntries(payload: unknown): LeaderboardEntry[] {
  const rows: BoardRow[] = Array.isArray(payload)
    ? (payload as BoardRow[])
    : ((payload as LeaderboardBoard)?.top ?? []);
  return rows.map<LeaderboardEntry>((r) => ({
    userId: String(r.userId ?? r.id ?? ''),
    name: r.name,
    avatar: r.avatar ?? r.avatarUrl ?? null,
    points: r.periodPoints ?? r.points ?? 0,
    rank: r.rank,
  }));
}

export function useLeaderboard(period: LeaderboardPeriod = 'week') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      try {
        return toEntries(await unwrap(apiGet<unknown>(`/leaderboard/${period}`, false)));
      } catch {
        return toEntries(await unwrap(apiGet<unknown>(`/leaderboard?period=${period}`, false)));
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
          ? { rank: me.rank, points: me.periodPoints ?? me.points ?? 0, total: me.totalPoints ?? 0 }
          : null;
      }
    },
    retry: false,
    staleTime: 3 * 60 * 1000,
  });
}
