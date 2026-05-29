import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MerchantDrawer } from '@/components/merchant-drawer';
import { MerchantTopBar } from '@/components/merchant-top-bar';
import { useEvents } from '@/hooks/use-events';
import type { PlatformEvent } from '@/services/types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MerchantEventsScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: events, isLoading } = useEvents();
  const list = events ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MerchantTopBar title="Events" onMenu={() => setDrawerOpen(true)} />
      <MerchantDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {isLoading && list.length === 0 ? (
          <Text style={styles.emptyText}>Loading events…</Text>
        ) : list.length === 0 ? (
          <Text style={styles.emptyText}>No events yet</Text>
        ) : (
          list.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onPress={() =>
                router.push({ pathname: '/merchant-event', params: { id: e.id } })
              }
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/merchant-event')}>
        <Ionicons name="add" size={22} color="#000" />
        <Text style={styles.fabText}>New Event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function EventCard({
  event,
  onPress,
}: {
  event: PlatformEvent;
  onPress: () => void;
}) {
  const statusColor =
    event.status === 'PUBLISHED'
      ? '#C4F27F'
      : event.status === 'DRAFT'
      ? '#FFB300'
      : event.status === 'CANCELLED'
      ? '#E53935'
      : 'rgba(255,255,255,0.5)';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}>
      <Image
        source={{ uri: event.coverImage ?? event.images?.[0] }}
        style={styles.cardImg}
      />
      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{event.type}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {event.status}
          </Text>
        </View>
        <Text style={styles.cardTitle}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.55)" />
          <Text style={styles.metaText}>
            {formatDate(event.startDate)} · {formatTime(event.startDate)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.55)" />
          <Text numberOfLines={1} style={styles.metaText}>
            {event.venue ?? event.address ?? '—'}
          </Text>
        </View>
        {event.capacity != null && (
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.55)" />
            <Text style={styles.metaText}>Capacity {event.capacity}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 140,
    gap: 12,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardImg: { width: '100%', height: 140 },
  cardBody: { padding: 14 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
  },
  typePillText: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 92,
    right: 18,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
});
