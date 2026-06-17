import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { ProfileStats, User } from '../services/types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => unwrap(apiGet<User>('/profile')),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfileStats() {
  return useQuery({
    queryKey: ['profile', 'stats'],
    // Docs (§6.5) spec GET /profile/stats but it isn't deployed. Degrade to null
    // rather than erroring — the profile screen reads points from /auth/me when
    // stats are absent. (Re-points automatically if the route ships later.)
    queryFn: async (): Promise<ProfileStats | null> => {
      try {
        return await unwrap(apiGet<ProfileStats>('/profile/stats'));
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; bio?: string; websiteUrl?: string }) =>
      unwrap(apiPut<User>('/profile', payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileUri: string) => {
      const token = await tokenStorage.get();
      const form = new FormData();
      form.append('file', { uri: fileUri, name: 'avatar.jpg', type: 'image/jpeg' } as any);
      const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
      const res = await fetch(`${base}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json() as Promise<{ avatarUrl: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
