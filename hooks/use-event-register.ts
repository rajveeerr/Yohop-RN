import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, unwrap } from '../services/api';

export type EventRegistration = {
  id: string;
  eventId: string;
  ticketTierId?: string;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  confirmationCode?: string;
};

export function useRegisterForEvent(eventId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      ticketTierId?: string;
      quantity: number;
      addOnIds?: string[];
    }) =>
      unwrap(
        apiPost<EventRegistration>(`/events/${eventId}/register`, payload),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}
