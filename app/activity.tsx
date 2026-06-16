import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import { useActivity, useTableBookings, useServiceBookings } from '@/hooks/use-bookings';
import { useProfileStats } from '@/hooks/use-profile';
import type { ActivityItem } from '@/services/types';

const KIND_META: Record<
  ActivityItem['kind'],
  { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }
> = {
  table: { icon: 'restaurant', bg: 'rgba(196,242,127,0.12)', fg: '#C4F27F' },
  service: { icon: 'sparkles', bg: 'rgba(196,242,127,0.12)', fg: '#C4F27F' },
  event: { icon: 'ticket', bg: 'rgba(255,179,0,0.18)', fg: '#FFB300' },
};

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ActivityScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: stats } = useProfileStats();
  const activity = useActivity();
  const tables = useTableBookings();
  const services = useServiceBookings();

  const totalCheckIns = stats?.totalCheckIns ?? 0;
  const points = stats?.points ?? me?.points ?? 0;
  const items = activity.items;
  const refreshing = tables.isRefetching || services.isRefetching;
  const onRefresh = () => { tables.refetch(); services.refetch(); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Activity</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C4F27F" />}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="location-outline" size={14} color="#C4F27F" />
              <Text style={styles.statTag}>GLOBAL</Text>
            </View>
            <Text style={styles.statValue}>{totalCheckIns}</Text>
            <Text style={styles.statLabel}>Total Check-ins</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="key-outline" size={14} color="#C4F27F" />
              <Text style={styles.statTag}>PRO</Text>
            </View>
            <Text style={styles.statValue}>{formatPoints(points)}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {activity.isLoading && items.length === 0 ? (
            <Text style={styles.emptyText}>Loading…</Text>
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>No activity yet</Text>
          ) : (
            items.map((a, idx) => {
              const meta = KIND_META[a.kind];
              return (
                <View
                  key={a.id}
                  style={[
                    styles.activityRow,
                    idx === items.length - 1 && { borderBottomWidth: 0 },
                  ]}>
                  <View style={[styles.activityIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={16} color={meta.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.activityTitle}>
                      {a.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.activityMeta}>
                      {a.sub} · {activity.formatRelative(a.date)}
                    </Text>
                  </View>
                  <Text style={styles.activityPoints}>+{a.points}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              );
            })
          )}
        </View>

        <View style={styles.exclusiveCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
            }}
            style={styles.exclusiveImg}
          />
          <View style={styles.exclusiveOverlay} />
          <View style={styles.exclusiveBody}>
            <View style={styles.exclusivePill}>
              <Text style={styles.exclusivePillText}>EXCLUSIVE</Text>
            </View>
            <Text style={styles.exclusiveTitle}>
              Unlock VIP access at Toy Room
            </Text>
            <Text style={styles.exclusiveSub}>
              Redeem 500 points for guestlist entry
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  statTag: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  clearAllText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  activityMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  activityPoints: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 30,
  },
  exclusiveCard: {
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.3)',
  },
  exclusiveImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  exclusiveOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  exclusiveBody: {
    padding: 14,
  },
  exclusivePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#C4F27F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  exclusivePillText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  exclusiveTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  exclusiveSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 4,
  },
});
