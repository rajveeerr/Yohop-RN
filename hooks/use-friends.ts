import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';

export type FriendUser = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
  email: string;
  points?: number;
  loyaltyTier?: string;
};
export type FriendRequest = FriendUser & { friendshipId: number };
export type ContactMatch = FriendUser & {
  friendshipStatus: 'none' | 'requested' | 'incoming' | 'friends';
};

// The /friends endpoints are additive on the backend; until it's redeployed they
// 404. Swallow errors to [] so the screens render their empty states instead of
// throwing (mirrors the app's resilient-fallback pattern).
async function safeList<T>(path: string): Promise<T[]> {
  const token = await tokenStorage.get();
  if (!token) return [];
  try {
    return await unwrap(apiGet<T[]>(path));
  } catch {
    return [];
  }
}

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => safeList<FriendUser>('/friends'),
    staleTime: 60 * 1000,
  });
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: () => safeList<FriendRequest>('/friends/requests'),
    staleTime: 60 * 1000,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      unwrap(apiPost('/friends/request', { userId })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useRespondFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'accept' | 'ignore' }) =>
      unwrap(apiPost(`/friends/${id}/${action}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useMatchContacts() {
  return useMutation({
    mutationFn: (emails: string[]) =>
      unwrap(apiPost<ContactMatch[]>('/friends/match-contacts', { emails })),
  });
}
