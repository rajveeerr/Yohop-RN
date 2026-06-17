import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiGet, unwrap } from '../services/api';
import { tokenStorage } from '../services/storage';
import type {
  ActivityItem,
  ServiceBooking,
  TableBooking,
} from '../services/types';

export function useTableBookings() {
  return useQuery({
    queryKey: ['bookings', 'tables'],
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return [] as TableBooking[];
      try {
        return await unwrap(apiGet<TableBooking[]>('/table-booking/my-bookings'));
      } catch {
        // Deployed backend lists the caller's bookings at /table-booking/bookings
        // under a `bookings` key, not the documented /table-booking/my-bookings.
        const res = await apiGet<unknown>('/table-booking/bookings');
        const r = res as { bookings?: unknown; data?: { bookings?: unknown } };
        const arr = r.bookings ?? r.data?.bookings ?? [];
        return (Array.isArray(arr) ? arr : []) as TableBooking[];
      }
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
      try {
        return await unwrap(apiGet<ServiceBooking[]>('/services/my-bookings'));
      } catch {
        // The documented /services/my-bookings is shadowed by /services/:id on the
        // deployed backend and there is no consumer service-bookings route yet —
        // degrade to empty so the profile activity list still renders.
        return [] as ServiceBooking[];
      }
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
