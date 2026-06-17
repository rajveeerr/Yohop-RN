import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { RenderedNudge } from '../services/types';

// SCHEMA UNVERIFIED — the docs spec the Nudge template (§4.15) and UserNudge
// delivery record but not what GET /nudges actually returns for display. We use
// RenderedNudge (id/type/title?/body?/imageUrl?/createdAt/dismissedAt?) as a
// best-effort display shape; consumers must tolerate missing title/body and fall
// back to the type label.
// The deployed /nudges + /nudges/history return UserNudge delivery records with
// the template nested under `nudge` (so type/createdAt aren't top-level). Map any
// shape to the RenderedNudge the screen expects.
function toRenderedNudge(item: any): RenderedNudge {
  const nudge = item?.nudge ?? {};
  return {
    id: String(item?.id ?? nudge?.id ?? Math.random()),
    type: item?.type ?? nudge?.type ?? 'INACTIVITY',
    title: item?.title ?? nudge?.title,
    body: item?.body ?? item?.message ?? nudge?.body ?? nudge?.message,
    imageUrl: item?.imageUrl ?? nudge?.imageUrl ?? null,
    iconUrl: item?.iconUrl ?? nudge?.iconUrl ?? null,
    createdAt:
      item?.createdAt ?? item?.sentAt ?? item?.deliveredAt ?? new Date().toISOString(),
    dismissedAt: item?.dismissedAt ?? null,
  };
}

export function useNudges() {
  return useQuery({
    queryKey: ['nudges'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as RenderedNudge[];
      // Docs (§6.16) spec GET /nudges; the deployed backend serves the list at
      // /nudges/history. Try the documented route first, then fall back.
      let raw: unknown;
      try {
        raw = await unwrap(apiGet<unknown>('/nudges'));
      } catch {
        raw = await unwrap(apiGet<unknown>('/nudges/history'));
      }
      const list = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
      return (Array.isArray(list) ? list : []).map(toRenderedNudge);
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
