import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { RenderedNudge } from '../services/types';

// SCHEMA UNVERIFIED — the docs spec the Nudge template (§4.15) and UserNudge
// delivery record but not what GET /nudges actually returns for display. We use
// RenderedNudge (id/type/title?/body?/imageUrl?/createdAt/dismissedAt?) as a
// best-effort display shape; consumers must tolerate missing title/body and fall
// back to the type label.
export function useNudges() {
  return useQuery({
    queryKey: ['nudges'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as RenderedNudge[];
      return unwrap(apiGet<RenderedNudge[]>('/nudges'));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDismissNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(apiPost<{ dismissed: boolean }>(`/nudges/${id}/dismiss`)),
    onMutate: async (nudgeId) => {
      await qc.cancelQueries({ queryKey: ['nudges'] });
      const prev = qc.getQueryData<RenderedNudge[]>(['nudges']);
      qc.setQueryData(['nudges'], (old: RenderedNudge[] = []) =>
        old.filter((n) => n.id !== nudgeId),
      );
      return { prev };
    },
    onError: (_err, _id, ctx: any) =>
      qc.setQueryData(['nudges'], ctx?.prev),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: ['nudges'] }),
  });
}
