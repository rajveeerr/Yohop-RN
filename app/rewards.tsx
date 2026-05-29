import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import {
  useAchievementProgress,
  useGamificationProfile,
} from '@/hooks/use-gamification';
import { useStreakRewards } from '@/hooks/use-streak';
import {
  useClaimVenueReward,
  useNearbyVenueRewards,
} from '@/hooks/use-venue-rewards';
import { useLocation } from '@/hooks/use-location';
import { useProfileStats } from '@/hooks/use-profile';
import type { Achievement, VenueReward } from '@/services/types';

type Tab = 'rewards' | 'badges';

const TIER_GOALS: Record<string, number> = {
  BRONZE: 1000,
  SILVER: 2500,
  GOLD: 5000,
  PLATINUM: 10000,
  DIAMOND: 25000,
};

function tierIconBg(idx: number) {
  const palette = [
    { bg: 'rgba(196,242,127,0.18)', fg: '#C4F27F', icon: 'wine-outline' as const },
    { bg: 'rgba(255,179,0,0.18)', fg: '#FFB300', icon: 'sparkles-outline' as const },
    { bg: 'rgba(174,128,255,0.22)', fg: '#AE80FF', icon: 'pricetag-outline' as const },
    { bg: 'rgba(196,242,127,0.18)', fg: '#C4F27F', icon: 'flash-outline' as const },
  ];
  return palette[idx % palette.length];
}

export default function RewardsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('rewards');
  const { data: me } = useMe();
  const { data: stats } = useProfileStats();
  const { data: gam } = useGamificationProfile();
  const { data: streakRewards } = useStreakRewards();
  const { data: achievements, isLoading: achLoading } = useAchievementProgress();
  const { location } = useLocation();
  const { data: nearbyRewards } = useNearbyVenueRewards({
    latitude: location.latitude,
    longitude: location.longitude,
  });
  const claim = useClaimVenueReward();

  const totalPoints = stats?.points ?? me?.points ?? 0;
  const tier = gam?.loyaltyTier ?? me?.loyaltyTier ?? 'BRONZE';
  const goal = gam?.nextTierAt ?? TIER_GOALS[tier] ?? 5000;
  const pct = Math.min(100, (totalPoints / goal) * 100);
  const nextTierLabel = gam?.nextTier ?? nextTierFrom(tier);

  const claimableStreak = useMemo(
    () => (streakRewards ?? []).filter((r) => !r.claimed),
    [streakRewards],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Your Rewards</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.totalValue}>{totalPoints.toLocaleString()}</Text>
            <Text style={styles.totalLabel}>TOTAL POINTS</Text>
          </View>
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={10} color="#C4F27F" />
            <Text style={styles.proBadgeText}>{tier} Member</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>
            {totalPoints.toLocaleString()} pts
          </Text>
          <Text style={styles.progressLabel}>
            {nextTierLabel ? `${nextTierLabel} at ${goal.toLocaleString()} pts` : 'Max tier'}
          </Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'rewards' && styles.tabActive]}
            onPress={() => setTab('rewards')}
            activeOpacity={0.85}>
            <Text
              style={[styles.tabText, tab === 'rewards' && styles.tabTextActive]}>
              Rewards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'badges' && styles.tabActive]}
            onPress={() => setTab('badges')}
            activeOpacity={0.85}>
            <Text
              style={[styles.tabText, tab === 'badges' && styles.tabTextActive]}>
              Badges
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'rewards' && (
          <View style={{ gap: 10 }}>
            {claimableStreak.map((sr, idx) => {
              const meta = tierIconBg(idx);
              return (
                <View key={sr.id} style={styles.rewardCard}>
                  <View style={[styles.rewardIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name="flame-outline" size={18} color={meta.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardTitle}>
                      {sr.rewardType === 'COINS'
                        ? `${sr.value} bonus coins`
                        : sr.rewardType === 'DISCOUNT'
                        ? `${sr.value}% off next visit`
                        : `${sr.rewardType} reward`}
                    </Text>
                    <Text style={styles.rewardMeta}>
                      {sr.milestoneDays}-day streak
                    </Text>
                  </View>
                  <View style={styles.joinedPill}>
                    <Text style={styles.joinedText}>Earned</Text>
                  </View>
                </View>
              );
            })}

            {(nearbyRewards ?? []).map((r: VenueReward, idx) => {
              const meta = tierIconBg(idx + claimableStreak.length);
              return (
                <View key={r.id} style={styles.rewardCard}>
                  <View style={[styles.rewardIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardTitle}>{r.name}</Text>
                    <Text style={styles.rewardMeta}>
                      {r.merchant?.businessName ?? r.description ?? 'Nearby venue'}
                    </Text>
                    <Text style={styles.rewardCost}>
                      {r.type === 'COINS'
                        ? `+${r.amount} coins`
                        : r.type === 'DISCOUNT'
                        ? `${r.amount}% off`
                        : `${r.amount} reward`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.redeemBtn}
                    activeOpacity={0.85}
                    disabled={claim.isPending}
                    onPress={() => claim.mutate(r.id)}>
                    <Text style={styles.redeemText}>Claim</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {claimableStreak.length === 0 &&
              (nearbyRewards ?? []).length === 0 && (
                <Text style={styles.empty}>
                  No rewards nearby — check in at venues to unlock more.
                </Text>
              )}
          </View>
        )}

        {tab === 'rewards' && (
          <Text style={styles.badgesHeader}>BADGES EARNED</Text>
        )}

        {(tab === 'badges' || tab === 'rewards') && (
          <BadgeGrid
            items={achievements ?? []}
            loading={achLoading}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function nextTierFrom(tier: string): string | null {
  const order = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const idx = order.indexOf(tier);
  if (idx < 0 || idx === order.length - 1) return null;
  return order[idx + 1];
}

function BadgeGrid({
  items,
  loading,
}: {
  items: { achievement: Achievement; completedAt: string | null; progress: number; total: number }[];
  loading: boolean;
}) {
  if (loading && items.length === 0) {
    return <Text style={styles.empty}>Loading badges…</Text>;
  }
  if (items.length === 0) {
    return <Text style={styles.empty}>No badges yet.</Text>;
  }
  return (
    <View style={styles.badgeGrid}>
      {items.map((it) => {
        const earned = !!it.completedAt;
        return (
          <View
            key={it.achievement.id}
            style={[styles.badgeCard, !earned && styles.badgeCardLocked]}>
            <View
              style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
              <Ionicons
                name="trophy"
                size={22}
                color={earned ? '#C4F27F' : 'rgba(255,255,255,0.35)'}
              />
            </View>
            <Text
              style={[
                styles.badgeTitle,
                !earned && { color: 'rgba(255,255,255,0.4)' },
              ]}>
              {it.achievement.name}
            </Text>
            <Text
              style={[
                styles.badgeMeta,
                !earned && { color: 'rgba(255,255,255,0.3)' },
              ]}>
              {earned
                ? it.achievement.description
                : `${it.progress}/${it.total}`}
            </Text>
            {!earned && (
              <View style={styles.lockIcon}>
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color="rgba(255,255,255,0.4)"
                />
              </View>
            )}
          </View>
        );
      })}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  totalValue: {
    color: '#C4F27F',
    fontSize: 30,
    fontWeight: '900',
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 2,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  proBadgeText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#C4F27F',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  tabText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: { color: '#000' },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rewardMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  rewardCost: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  redeemBtn: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  joinedPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,179,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.4)',
  },
  joinedText: {
    color: '#FFB300',
    fontSize: 11,
    fontWeight: '800',
  },
  badgesHeader: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 24,
    marginBottom: 10,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    minHeight: 130,
  },
  badgeCardLocked: {
    opacity: 0.55,
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeIconLocked: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  empty: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 30,
    width: '100%',
  },
});
