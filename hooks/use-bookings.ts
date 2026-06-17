import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiGet } from '../services/api';
import { tokenStorage } from '../services/storage';
import type {
  ActivityItem,
  ServiceBooking,
  TableBooking,
} from '../services/types';

// Booking endpoints come back in several shapes across routes: a bare array, an
// envelope { success, data }, or an object with a named key ({ bookings }/{ items }).
// Dig the array out of any of them so consumers always get an array (never an
// object that would explode on .forEach/.map).
function pickArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (!res || typeof res !== 'object') return [];
  const candidates = [
    res.bookings,
    res.items,
    res.results,
    res.data,
    res.data?.bookings,
    res.data?.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c as T[];
  return [];
}

export function useTableBookings() {
  return useQuery({
    queryKey: ['bookings', 'tables'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as TableBooking[];
      // Try the documented path, then the deployed /table-booking/bookings.
      const primary = pickArray<TableBooking>(
        await apiGet<unknown>('/table-booking/my-bookings'),
      );
      if (primary.length) return primary;
      return pickArray<TableBooking>(await apiGet<unknown>('/table-booking/bookings'));
    },
    staleTime: 60 * 1000,
  });
}

export function useServiceBookings() {
  return useQuery({
    queryKey: ['bookings', 'services'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as ServiceBooking[];
      // Documented path, then the deployed /users/me/service-bookings.
      const primary = pickArray<ServiceBooking>(
        await apiGet<unknown>('/services/my-bookings'),
      );
      if (primary.length) return primary;
      return pickArray<ServiceBooking>(
        await apiGet<unknown>('/users/me/service-bookings'),
      );
    },
    staleTime: 60 * 1000,
  });
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return 'Today';
  const diffDays = Math.round(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string, time?: string | null): string {
  if (time) return time;
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function useActivity() {
  const tables = useTableBookings();
  const services = useServiceBookings();

  const items: ActivityItem[] = useMemo(() => {
    const out: ActivityItem[] = [];
    (tables.data ?? []).forEach((b) => {
      out.push({
        id: `t-${b.id}`,
        kind: 'table',
        title: b.merchant?.businessName ?? 'Table booking',
        sub: `Table for ${b.partySize} · ${formatTime(b.date, b.time)}`,
        date: b.date,
        points: 120,
        emoji: '🍽️',
      });
    });
    (services.data ?? []).forEach((b) => {
      out.push({
        id: `s-${b.id}`,
        kind: 'service',
        title: b.service?.title ?? 'Service booking',
        sub: `${b.service?.duration ? `${b.service.duration} min · ` : ''}${b.service?.type ?? ''}`.trim() || 'Service',
        date: b.date,
        points: 200,
        emoji: '💆',
      });
    });
    return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tables.data, services.data]);

  return {
    items,
    isLoading: tables.isLoading || services.isLoading,
    error: tables.error ?? services.error,
    formatRelative,
    bookingsCount: (tables.data?.length ?? 0) + (services.data?.length ?? 0),
  };
}
