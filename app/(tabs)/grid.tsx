import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import { useDeals } from '@/hooks/use-deals';
import { useLeaderboard, useMyRank } from '@/hooks/use-leaderboard';

type Category = { key: string; label: string; emoji: string };
const CATEGORIES: Category[] = [
  { key: 'restaurants', label: 'Restaurants', emoji: '🍜' },
  { key: 'bars', label: 'Bars', emoji: '🍹' },
  { key: 'events', label: 'Events', emoji: '🎁' },
  { key: 'retail', label: 'Retail', emoji: '🛍️' },
  { key: 'fitness', label: 'Fitness', emoji: '🧃' },
  { key: 'beauty', label: 'Beauty', emoji: '💄' },
  { key: 'spa', label: 'Spa', emoji: '🧖' },
  { key: 'more', label: 'More', emoji: '•••' },
];

type LeaderRow = {
  id: string;
  rank: number | string;
  name: string;
  sub?: string;
  checkIns: number;
  medal?: '🥇' | '🥈' | '🥉';
  isMe?: boolean;
};

const MEDALS: Record<number, '🥇' | '🥈' | '🥉'> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function firstName(name: string | null | undefined): string {
  if (!name) return 'there';
  return name.split(' ')[0];
}

export default function GridScreen() {
  const router = useRouter();
  const [offerVisible, setOfferVisible] = useState(true);
  const [weekLabel, setWeekLabel] = useState<'This Week' | 'This Month'>('This Week');
  const { data: me } = useMe();
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard('week');
  const { data: myRank } = useMyRank('week');
  const { data: activeDeals } = useDeals({ isActive: true, isFlashSale: true });
  const offerCount = activeDeals?.length ?? 0;

  const topRows: LeaderRow[] = (leaderboard ?? []).slice(0, 3).map((e) => ({
    id: e.userId,
    rank: e.rank,
    name: e.name,
    checkIns: e.points,
    medal: MEDALS[e.rank],
  }));

  const meRow: LeaderRow | null = myRank
    ? {
        id: 'me',
        rank: `#${myRank.rank}`,
        name: `You · ${firstName(me?.name)}`,
        sub:
          myRank.rank > 6
            ? `${Math.max(0, (topRows[5]?.checkIns ?? myRank.points + 3) - myRank.points)} more to reach #6`
            : undefined,
        checkIns: myRank.points,
        isMe: true,
      }
    : null;

  const rows: LeaderRow[] = meRow ? [...topRows, meRow] : topRows;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>
          Good evening <Text style={styles.sparkle}>✦</Text>
        </Text>
        <Text style={styles.hey}>Hey, {firstName(me?.name)}</Text>

        {offerVisible && <View style={styles.offerCard}>
          <View style={styles.offerTextCol}>
            <Text style={styles.offerTag}>
              {offerCount > 0 ? `${offerCount} OFFERS ACTIVE` : 'OFFERS COMING SOON'}
            </Text>
            <Text style={styles.offerTitle}>Unlock your{'\n'}weekend deals</Text>
            <Text style={styles.offerSub}>Expires in 3 days • Terms apply</Text>
            <View style={styles.offerCtaRow}>
              <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.85} onPress={() => router.push('/(tabs)')}>
                <Text style={styles.viewAllText}>View all offers</Text>
              </TouchableOpacity>
              <TouchableOpacity hitSlop={8} onPress={() => setOfferVisible(false)}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dotsRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>%</Text>
          </View>
        </View>}

        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={styles.tile}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)',
                  params: { category: c.key },
                })
              }>
              <View style={styles.tileIconBox}>
                <Text style={styles.tileEmoji}>{c.emoji}</Text>
              </View>
              <Text style={styles.tileLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Leaderboard</Text>
        <View style={styles.leaderCard}>
          <View style={styles.leaderHeader}>
            <Text style={styles.leaderTitle}>Top Check-ins</Text>
            <TouchableOpacity style={styles.weekPill} activeOpacity={0.8} onPress={() => setWeekLabel(weekLabel === 'This Week' ? 'This Month' : 'This Week')}>
              <Ionicons name="calendar-outline" size={12} color="#fff" />
              <Text style={styles.weekText}>{weekLabel}</Text>
              <Ionicons name="chevron-down" size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          {lbLoading && rows.length === 0 ? (
            <ActivityIndicator color="#C4F27F" style={{ paddingVertical: 20 }} />
          ) : rows.length === 0 ? (
            <Text style={styles.emptyRow}>No leaderboard data yet</Text>
          ) : (
            rows.map((r) => (
              <View key={r.id} style={styles.leaderRow}>
                <View style={styles.rankCol}>
                  {r.medal ? (
                    <Text style={styles.medalEmoji}>{r.medal}</Text>
                  ) : (
                    <Text style={styles.rankText}>{r.rank}</Text>
                  )}
                </View>
                <View style={styles.avatar} />
                <View style={styles.leaderTextCol}>
                  <Text
                    style={[styles.leaderName, r.isMe && styles.leaderNameMe]}>
                    {r.name}
                  </Text>
                  {r.sub && (
                    <Text
                      style={[styles.leaderSub, r.isMe && styles.leaderSubMe]}>
                      {r.sub}
                    </Text>
                  )}
                </View>
                <View style={styles.checkInCol}>
                  <Text
                    style={[styles.checkInNum, r.isMe && styles.checkInNumMe]}>
                    {r.checkIns}
                  </Text>
                  <Text
                    style={[styles.checkInLbl, r.isMe && styles.checkInLblMe]}>
                    points
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress to #6</Text>
            <Text style={styles.progressValue}>9/12</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <TouchableOpacity style={styles.viewFull} activeOpacity={0.8} onPress={() => router.push('/leaderboard')}>
          <Text style={styles.viewFullText}>View full leaderboard </Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 110,
  },
  greeting: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  sparkle: { color: '#C4F27F' },
  hey: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  offerCard: {
    backgroundColor: '#C4F27F',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  offerTextCol: { flex: 1 },
  offerTag: {
    color: '#1a1a1a',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  offerTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    lineHeight: 24,
  },
  offerSub: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 10,
    marginTop: 4,
  },
  offerCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  viewAllBtn: {
    backgroundColor: '#000',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  dismissText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  dotActive: {
    width: 12,
    backgroundColor: '#000',
  },
  offerBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  offerBadgeText: {
    color: '#C4F27F',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '23%',
    alignItems: 'center',
  },
  tileIconBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tileEmoji: {
    fontSize: 24,
  },
  tileLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
  leaderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  leaderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaderTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  weekText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  rankCol: {
    width: 22,
    alignItems: 'center',
  },
  medalEmoji: { fontSize: 16 },
  rankText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  leaderTextCol: { flex: 1 },
  leaderName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  leaderNameMe: { color: '#C4F27F' },
  leaderSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 1,
  },
  leaderSubMe: { color: 'rgba(196,242,127,0.7)' },
  checkInCol: {
    alignItems: 'flex-end',
  },
  checkInNum: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkInNumMe: { color: '#C4F27F' },
  checkInLbl: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
  },
  checkInLblMe: { color: 'rgba(196,242,127,0.7)' },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  progressValue: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#C4F27F',
    borderRadius: 2,
  },
  viewFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
  },
  viewFullText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyRow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
