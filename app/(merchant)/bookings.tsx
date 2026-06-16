import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MerchantDrawer } from '@/components/merchant-drawer';
import { MerchantTopBar } from '@/components/merchant-top-bar';
import { useMerchantBookings, useUpdateMerchantBookingStatus } from '@/hooks/use-table-booking';
import type { BookingStatus, TableBooking } from '@/services/types';

type Filter = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Past' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLE: Record<BookingStatus, { bg: string; fg: string; label: string }> = {
  PENDING: { bg: 'rgba(255,179,0,0.18)', fg: '#FFB300', label: 'Pending' },
  CONFIRMED: { bg: 'rgba(196,242,127,0.18)', fg: '#C4F27F', label: 'Confirmed' },
  CANCELLED: { bg: 'rgba(229,57,53,0.18)', fg: '#E53935', label: 'Cancelled' },
  COMPLETED: { bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.65)', label: 'Completed' },
  NO_SHOW: { bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.55)', label: 'No-show' },
};

export default function MerchantBookingsScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading } = useMerchantBookings();
  const updateStatus = useUpdateMerchantBookingStatus();

  const allBookings: TableBooking[] = data ?? [];
  const filtered = allBookings.filter((b) =>
    filter === 'all' ? true : b.status === filter,
  );

  const showActions = (b: TableBooking) => {
    Alert.alert(b.confirmationCode, `Party of ${b.partySize} · ${b.date} ${b.time ?? ''}`, [
      {
        text: 'Confirm',
        onPress: () => updateStatus.mutate({ bookingId: String(b.id), status: 'CONFIRMED' }),
      },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: () => updateStatus.mutate({ bookingId: String(b.id), status: 'CANCELLED' }),
      },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MerchantTopBar title="Bookings" onMenu={() => setDrawerOpen(true)} />
      <MerchantDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.filterPillText,
                filter === f.key && styles.filterPillTextActive,
              ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading && allBookings.length === 0 ? (
        <ActivityIndicator color="#C4F27F" style={{ marginTop: 40 }} />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {filtered.map((b) => {
          const s = STATUS_STYLE[b.status];
          return (
            <TouchableOpacity
              key={b.id}
              style={styles.row}
              activeOpacity={0.85}
              onPress={() => showActions(b)}>
              <View style={styles.partyCircle}>
                <Text style={styles.partyText}>{b.partySize}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{b.confirmationCode}</Text>
                <Text style={styles.rowSub}>
                  {b.date} · {b.time ?? '—'}
                </Text>
                {b.specialRequests ? (
                  <Text numberOfLines={1} style={styles.rowNote}>
                    “{b.specialRequests}”
                  </Text>
                ) : null}
              </View>
              <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                <Text style={[styles.statusText, { color: s.fg }]}>
                  {s.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No bookings in this view</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  filterRow: {
    paddingHorizontal: 14,
    gap: 8,
    paddingVertical: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  filterPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 140,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  partyCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  partyText: {
    color: '#C4F27F',
    fontSize: 14,
    fontWeight: '800',
  },
  rowTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rowSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  rowNote: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
});
