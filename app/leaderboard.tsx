import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import { useLeaderboard, useMyRank } from '@/hooks/use-leaderboard';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/services/types';

type Scope = 'friends' | 'city' | 'global';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all-time', label: 'All time' },
];

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'friends', label: 'Friends' },
  { key: 'city', label: 'City' },
  { key: 'global', label: 'Global' },
];

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function initials(name: string): string {
  const clean = name.replace(/^You\s*·\s*/, '');
  const parts = clean.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [scope, setScope] = useState<Scope>('global');
  const { data: me } = useMe();
  const { data: entries, isLoading, isRefetching, refetch } = useLeaderboard(period);
  const { data: myRank } = useMyRank(period);

  const list: LeaderboardEntry[] = entries ?? [];
  const top3 = useMemo(() => list.filter((e) => e.rank <= 3), [list]);
  const rest = useMemo(
    () =>
      list
        .filter((e) => e.rank > 3 && e.userId !== me?.id)
        .slice(0, 6),
    [list, me?.id],
  );

  const podiumOrder = [
    top3.find((e) => e.rank === 2),
    top3.find((e) => e.rank === 1),
    top3.find((e) => e.rank === 3),
  ].filter((x): x is LeaderboardEntry => !!x);

  const myEntry = list.find((e) => e.userId === me?.id);
  const myName = me?.name ? `You · ${me.name.split(' ')[0]}` : 'You';
  const myPoints = myEntry?.points ?? myRank?.points ?? 0;
  const myRankNum = myEntry?.rank ?? myRank?.rank;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Leaderboard</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.shareLink}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#C4F27F" />}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.pill, period === p.key && styles.pillActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.pillText,
                  period === p.key && styles.pillTextActive,
                ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillRow}>
          {SCOPES.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.scopePill, scope === s.key && styles.scopePillActive]}
              onPress={() => setScope(s.key)}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.scopePillText,
                  scope === s.key && styles.scopePillTextActive,
                ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading && list.length === 0 ? (
          <Text style={styles.empty}>Loading leaderboard…</Text>
        ) : list.length === 0 ? (
          <Text style={styles.empty}>No rankings yet</Text>
        ) : (
          <>
            <View style={styles.podium}>
              {podiumOrder.map((e) => {
                const isFirst = e.rank === 1;
                return (
                  <View
                    key={e.userId}
                    style={[styles.podiumCol, isFirst && styles.podiumColFirst]}>
                    {isFirst && (
                      <View style={styles.crown}>
                        <Ionicons name="trophy" size={16} color="#FFB300" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.podiumAvatar,
                        isFirst && styles.podiumAvatarFirst,
                      ]}>
                      <Text
                        style={[
                          styles.podiumInitials,
                          isFirst && styles.podiumInitialsFirst,
                        ]}>
                        {initials(e.name)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.podiumName, isFirst && styles.podiumNameFirst]}>
                      {e.name}
                    </Text>
                    <Text
                      style={[styles.podiumPts, isFirst && styles.podiumPtsFirst]}>
                      {formatPoints(e.points)}
                    </Text>
                    <View
                      style={[
                        styles.podiumBlock,
                        isFirst ? styles.podiumBlockFirst : null,
                        e.rank === 2 ? styles.podiumBlockSecond : null,
                        e.rank === 3 ? styles.podiumBlockThird : null,
                      ]}>
                      <Text
                        style={[
                          styles.podiumRank,
                          isFirst && styles.podiumRankFirst,
                        ]}>
                        {e.rank}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {myRankNum ? (
              <View style={styles.youCard}>
                <View style={styles.youRankPill}>
                  <Text style={styles.youRankText}>#{myRankNum}</Text>
                </View>
                <View style={styles.youAvatar}>
                  <Text style={styles.youAvatarText}>{initials(myName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.youName}>{myName}</Text>
                  <Text style={styles.youMeta}>this period</Text>
                </View>
                <Text style={styles.youPoints}>{formatPoints(myPoints)}</Text>
              </View>
            ) : null}

            <View style={styles.listCard}>
              {rest.map((e, idx) => (
                <View
                  key={e.userId}
                  style={[
                    styles.row,
                    idx === rest.length - 1 && { borderBottomWidth: 0 },
                  ]}>
                  <Text style={styles.rank}>{e.rank}</Text>
                  <View style={styles.rowAvatar}>
                    <Text style={styles.rowAvatarText}>{initials(e.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{e.name}</Text>
                  </View>
                  <Text style={styles.rowPoints}>{e.points.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.expandBtn} activeOpacity={0.8}>
              <Ionicons name="chevron-down" size={18} color="#000" />
            </TouchableOpacity>
          </>
        )}
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
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  shareLink: {
    color: '#C4F27F',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  pillScroll: { flexGrow: 0 },
  pillRow: {
    gap: 8,
    paddingVertical: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  pillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextActive: { color: '#000', fontWeight: '700' },
  scopePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  scopePillActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.45)',
  },
  scopePillText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
  },
  scopePillTextActive: { color: '#C4F27F', fontWeight: '700' },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 6,
    height: 220,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumColFirst: {
    flex: 1.1,
  },
  crown: {
    marginBottom: 4,
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumAvatarFirst: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#C4F27F',
  },
  podiumInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  podiumInitialsFirst: {
    color: '#C4F27F',
    fontSize: 16,
  },
  podiumName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  podiumNameFirst: {
    color: '#C4F27F',
    fontSize: 12,
  },
  podiumPts: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  podiumPtsFirst: {
    color: '#C4F27F',
    fontSize: 12,
  },
  podiumBlock: {
    width: '100%',
    marginTop: 10,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  podiumBlockFirst: {
    height: 80,
    backgroundColor: 'rgba(196,242,127,0.18)',
    borderColor: '#C4F27F',
  },
  podiumBlockSecond: {
    height: 60,
    backgroundColor: '#1a1a1a',
  },
  podiumBlockThird: {
    height: 44,
    backgroundColor: '#1a1a1a',
  },
  podiumRank: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  podiumRankFirst: {
    color: '#C4F27F',
    fontSize: 26,
  },
  youCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: 'rgba(196,242,127,0.10)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  youRankPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  youRankText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '800',
  },
  youAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youAvatarText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  youName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  youMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  youPoints: {
    color: '#C4F27F',
    fontSize: 14,
    fontWeight: '800',
  },
  listCard: {
    marginTop: 14,
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rank: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '700',
    width: 18,
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  rowName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rowPoints: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
  },
  expandBtn: {
    alignSelf: 'center',
    marginTop: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
