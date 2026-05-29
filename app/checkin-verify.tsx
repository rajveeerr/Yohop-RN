import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FakeQR } from '@/components/fake-qr';
import { useEventCheckIn, useUserCheckIn } from '@/hooks/use-checkin';
import { useEvent } from '@/hooks/use-events';
import { useLocation } from '@/hooks/use-location';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 36;

export default function CheckinVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string;
    merchantId?: string;
    title?: string;
    tickets?: string;
  }>();
  const ticketsCount = Math.max(1, Number(params.tickets || '1'));
  const title = params.title || 'Check-in';
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const { location } = useLocation();
  const { data: event } = useEvent(params.eventId);
  const eventCheckIn = useEventCheckIn(params.eventId);
  const userCheckIn = useUserCheckIn();
  const busy = eventCheckIn.isPending || userCheckIn.isPending;

  const onCheckIn = async () => {
    try {
      if (params.eventId) {
        await eventCheckIn.mutateAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } else if (params.merchantId) {
        await userCheckIn.mutateAsync({
          merchantId: params.merchantId,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
      router.push({
        pathname: '/checkin-complete',
        params: {
          eventId: params.eventId ?? '',
          title,
          tickets: String(ticketsCount),
        },
      });
    } catch (e: any) {
      Alert.alert('Check-in failed', e?.message ?? 'Please try again.');
    }
  };

  const dateLabel = event?.startDate
    ? new Date(event.startDate).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
      })
    : '—';
  const timeLabel = event?.startDate
    ? new Date(event.startDate).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';
  const venueLabel = event?.venue ?? '—';

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    if (next !== page) setPage(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCol}>
          <Text style={styles.topTitle}>Verify</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressDotDone]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>
        </View>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Your ticket</Text>
        <Text style={styles.sub}>Show this QR at Gate B to enter</Text>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.qrTrack}>
          {new Array(ticketsCount).fill(0).map((_, i) => (
            <View key={i} style={[styles.qrCardWrap, { width: CARD_W }]}>
              <View style={styles.qrCard}>
                <FakeQR seed={`${params.eventId ?? 'evt'}-ticket-${i + 1}`} size={220} />
                <View style={styles.qrFooter}>
                  <Text style={styles.qrFooterText}>
                    Scan at Gate B · Ticket {i + 1} of {ticketsCount}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {ticketsCount > 1 && (
          <View style={styles.pagerDots}>
            {new Array(ticketsCount).fill(0).map((_, i) => (
              <View
                key={i}
                style={[styles.pagerDot, i === page && styles.pagerDotActive]}
              />
            ))}
          </View>
        )}

        <View style={styles.detailsCard}>
          <Row label="Event" value={title} />
          <Row label="Date" value={dateLabel} />
          <Row label="Time" value={timeLabel} />
          <Row label="Venue" value={venueLabel} highlight />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, busy && { opacity: 0.6 }]}
          activeOpacity={0.85}
          disabled={busy}
          onPress={onCheckIn}>
          <Ionicons name="finger-print" size={14} color="#000" />
          <Text style={styles.ctaText}>
            {busy ? 'Checking in…' : 'Check-in Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHl]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerCol: { alignItems: 'center' },
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  progressRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  progressDot: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressDotActive: { backgroundColor: '#C4F27F' },
  progressDotDone: { backgroundColor: 'rgba(196,242,127,0.55)' },
  scroll: { paddingBottom: 110 },
  h1: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    paddingHorizontal: 18,
  },
  sub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 18,
  },
  qrTrack: {
    paddingTop: 18,
    paddingHorizontal: 18,
    gap: 0,
  },
  qrCardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCard: {
    width: CARD_W - 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 14,
  },
  qrFooter: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  qrFooterText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  pagerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  pagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pagerDotActive: {
    width: 18,
    backgroundColor: '#C4F27F',
  },
  detailsCard: {
    marginTop: 20,
    marginHorizontal: 18,
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
  rowValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rowValueHl: { color: '#C4F27F' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4F27F',
  },
  ctaText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
