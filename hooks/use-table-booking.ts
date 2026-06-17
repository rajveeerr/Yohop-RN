import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type { TableBooking } from '../services/types';

export type TableAvailabilitySlot = {
  date: string;
  time: string;
  available: boolean;
  capacity?: number;
  remaining?: number;
};

export function useTableAvailability(params: {
  merchantId: string | undefined;
  date?: string;
  partySize?: number;
}) {
  const { merchantId, date, partySize } = params;
  const qs = new URLSearchParams();
  if (date) qs.set('date', date);
  if (partySize) qs.set('partySize', String(partySize));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery({
    queryKey: ['table-booking', 'availability', merchantId, date, partySize],
    queryFn: () =>
      unwrap(
        apiGet<TableAvailabilitySlot[]>(
          `/table-booking/merchants/${merchantId}/availability${suffix}`,
          false,
        ),
      ),
    enabled: !!merchantId,
    staleTime: 2 * 60 * 1000,
  });
}

export type BookTablePayload = {
  merchantId: string;
  date: string;
  time?: string;
  partySize: number;
  specialRequests?: string;
};

export function useBookTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookTablePayload) =>
      unwrap(apiPost<TableBooking>('/table-booking/book', payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'tables'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      unwrap(apiDelete<{ cancelled: boolean }>(`/table-booking/${bookingId}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'tables'] });
    },
  });
}

export function useModifyBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      bookingId: string;
      date?: string;
      time?: string;
      partySize?: number;
      specialRequests?: string;
    }) => {
      const { bookingId, ...body } = payload;
      return unwrap(apiPut<TableBooking>(`/table-booking/${bookingId}`, body));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'tables'] });
    },
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const token = await tokenStorage.get();
      if (!token) throw new Error('Not authenticated');
      return unwrap(
        apiPost<TableBooking>(`/table-booking/${bookingId}/confirm`),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings', 'tables'] });
    },
  });
}

export function useMerchantBookings() {
  return useQuery({
    queryKey: ['merchant-bookings'],
    queryFn: () =>
      unwrap(apiGet<TableBooking[]>('/table-booking/merchant/bookings', true)),
    staleTime: 60 * 1000,
  });
}

export function useUpdateMerchantBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      unwrap(
        apiPut<TableBooking>(`/table-booking/merchant/bookings/${bookingId}/status`, { status }),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchant-bookings'] });
    },
  });
}
