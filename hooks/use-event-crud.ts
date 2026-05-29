import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiPost, apiPut, unwrap } from '../services/api';
import type { EventTicketTier, PlatformEvent } from '../services/types';

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PlatformEvent>) =>
      unwrap(apiPost<PlatformEvent>('/events', payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { eventId: string } & Partial<PlatformEvent>) => {
      const { eventId, ...body } = payload;
      return unwrap(apiPut<PlatformEvent>(`/events/${eventId}`, body));
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['events', variables.eventId] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      unwrap(apiDelete<{ deleted: boolean }>(`/events/${eventId}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCreateTicketTier(eventId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EventTicketTier>) =>
      unwrap(apiPost<EventTicketTier>(`/events/${eventId}/tickets`, payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}
