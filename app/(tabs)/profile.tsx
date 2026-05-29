import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { UserDrawer } from '@/components/user-drawer';
import { useMe } from '@/hooks/use-auth';
import { useActivity } from '@/hooks/use-bookings';
import { useAchievementProgress } from '@/hooks/use-gamification';
import { useMyRank } from '@/hooks/use-leaderboard';
import { useProfileStats } from '@/hooks/use-profile';
import { useRouter } from 'expo-router';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';

type Interest = { key: string; label: string; emoji: string };
const INTERESTS: Interest[] = [
  { key: 'dining', label: 'Dining', emoji: '🍽️' },
  { key: 'concerts', label: 'Concerts', emoji: '🎵' },
  { key: 'bars', label: 'Bar Nights', emoji: '🍹' },
  { key: 'events', label: 'Events', emoji: '🎫' },
  { key: 'spa', label: 'Spa', emoji: '💆' },
];

const GRID_IMAGES = [
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
  'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
];

type ViewMode = 'grid' | 'list' | 'starred' | 'featured' | 'liked';

function usernameFrom(email: string | null | undefined): string {
  if (!email) return 'user';
  return email.split('@')[0];
}

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ProfileScreen() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('list');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: me } = useMe();
  const { data: stats } = useProfileStats();
  const { data: myRank } = useMyRank('all-time');
  const activity = useActivity();
  const merchantProfile = useStoredMerchantProfile();

  const firstName = me?.name?.split(' ')[0] ?? 'You';
  const tier = me?.loyaltyTier ?? 'BRONZE';
  const points = stats?.points ?? me?.points ?? 0;
  const bookingsCount = activity.bookingsCount;
  const rankLabel = myRank?.rank ? `#${myRank.rank}` : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <Text style={styles.username}>{usernameFrom(me?.email)}</Text>
        <TouchableOpacity hitSlop={8} onPress={() => setDrawerOpen(true)}>
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <UserDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[3]}>
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View style={styles.statsCol}>
            <Stat num={String(bookingsCount)} label="Bookings" />
            <Stat num={formatPoints(points)} label="Points" />
            <Stat num={rankLabel} label="Rank" />
          </View>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name}>{me?.name ?? firstName}</Text>
          <View style={styles.memberRow}>
            <Text style={styles.sparkle}>✦</Text>
            <Text style={styles.memberText}>{tier} MEMBER</Text>
          </View>
          <Text style={styles.bio}>
            Avid foodie, gig-goer and spa enthusiast. Delhi&apos;s Best spots,
            one tap at a time.
          </Text>
          {merchantProfile && (
            <TouchableOpacity
              style={styles.proBadge}
              activeOpacity={0.85}
              onPress={() => router.replace('/(merchant)' as never)}>
              <Ionicons name="briefcase" size={11} color="#C4F27F" />
              <Text style={styles.proBadgeText}>Professional Dashboard</Text>
              <Ionicons name="chevron-forward" size={12} color="#C4F27F" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stickyWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.interestsRow}>
            {INTERESTS.map((i) => (
              <View key={i.key} style={styles.interestItem}>
                <View style={styles.interestIcon}>
                  <Text style={styles.interestEmoji}>{i.emoji}</Text>
                </View>
                <Text style={styles.interestLabel}>{i.label}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.viewTabs}>
            <ViewTab
              active={view === 'grid'}
              onPress={() => setView('grid')}
              icon={<Ionicons name="grid-outline" size={18} color="#fff" />}
            />
            <ViewTab
              active={view === 'list'}
              onPress={() => setView('list')}
              icon={
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={20}
                  color="#fff"
                />
              }
            />
            <ViewTab
              active={view === 'starred'}
              onPress={() => setView('starred')}
              icon={<Ionicons name="star-outline" size={18} color="#fff" />}
            />
            <ViewTab
              active={view === 'featured'}
              onPress={() => setView('featured')}
              icon={
                <View style={styles.fBadge}>
                  <Text style={styles.fBadgeText}>F</Text>
                </View>
              }
            />
            <ViewTab
              active={view === 'liked'}
              onPress={() => setView('liked')}
              icon={<Ionicons name="heart-outline" size={18} color="#fff" />}
            />
          </View>
        </View>

        {view === 'grid' && (
          <View style={styles.grid}>
            {GRID_IMAGES.map((uri, idx) => (
              <View key={idx} style={styles.gridItem}>
                <Image source={{ uri }} style={styles.gridImage} />
                <View style={styles.pointsPill}>
                  <Text style={styles.pointsText}>
                    +{idx % 2 === 1 ? 300 : 120} pts
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {view === 'list' && (
          <View style={styles.listWrap}>
            {activity.isLoading && activity.items.length === 0 ? (
              <Text style={styles.emptyListText}>Loading…</Text>
            ) : activity.items.length === 0 ? (
              <Text style={styles.emptyListText}>No bookings yet</Text>
            ) : (
              activity.items.map((a) => (
                <View key={a.id} style={styles.listRow}>
                  <View style={styles.listIcon}>
                    <Text style={styles.listEmoji}>{a.emoji}</Text>
                  </View>
                  <View style={styles.listTextCol}>
                    <Text style={styles.listTitle}>{a.title}</Text>
                    <Text style={styles.listSub}>{a.sub}</Text>
                  </View>
                  <View style={styles.listRightCol}>
                    <Text style={styles.listPoints}>+{a.points} pts</Text>
                    <Text style={styles.listWhen}>
                      {activity.formatRelative(a.date)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {view === 'starred' && <StarredView />}

        {view === 'featured' && <FeaturedView />}

        {view === 'liked' && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nothing here yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

function ViewTab({
  active,
  onPress,
  icon,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[styles.viewTab, active && styles.viewTabActive]}
      activeOpacity={0.8}
      onPress={onPress}>
      {icon}
    </TouchableOpacity>
  );
}

function formatEarnedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function StarredView() {
  const { data: achievements, isLoading } = useAchievementProgress();
  const items = achievements ?? [];

  if (isLoading && items.length === 0) {
    return <Text style={styles.emptyListText}>Loading badges…</Text>;
  }
  if (items.length === 0) {
    return <Text style={styles.emptyListText}>No badges yet</Text>;
  }

  return (
    <View style={styles.badgeGrid}>
      {items.map((a) => {
        const earned = !!a.completedAt;
        return (
          <View key={a.achievementId} style={styles.badgeCard}>
            <Text style={styles.badgeEmoji}>🏆</Text>
            <Text style={styles.badgeTitle}>{a.achievement.name}</Text>
            <Text style={styles.badgeSub}>{a.achievement.description}</Text>
            {earned ? (
              <View style={styles.badgeStatusRow}>
                <Ionicons name="checkmark-circle" size={12} color="#C4F27F" />
                <Text style={styles.badgeEarned}>
                  Earned {formatEarnedDate(a.completedAt!)}
                </Text>
              </View>
            ) : (
              <Text style={styles.badgeProgress}>
                {a.progress} of {a.total} done
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

type Benefit = {
  id: string;
  label: string;
  status: string;
  tone: 'good' | 'muted' | 'active';
};
const BENEFITS: Benefit[] = [
  { id: '1', label: 'Free drink', status: '1 left', tone: 'good' },
  { id: '2', label: 'Priority slots', status: 'used', tone: 'muted' },
  { id: '3', label: 'Events presale access', status: 'Active', tone: 'active' },
];

function FeaturedView() {
  return (
    <View style={styles.featuredWrap}>
      <View style={styles.memberCard}>
        <View style={styles.memberBlob} />
        <View style={styles.memberTagRow}>
          <Text style={styles.sparkle}>✦</Text>
          <Text style={styles.memberText}>GOLD MEMBER</Text>
        </View>
        <Text style={styles.memberName}>Yashika Sharma</Text>
        <View style={styles.perkPillsRow}>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>Priority booking</Text>
          </View>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>+2x points</Text>
          </View>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>Free 1 drink/mo</Text>
          </View>
        </View>
        <View style={styles.perkPillsRow}>
          <View style={styles.perkPill}>
            <Text style={styles.perkPillText}>Early Access</Text>
          </View>
        </View>
      </View>

      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Benefits remaining this month</Text>
        {BENEFITS.map((b) => (
          <View key={b.id} style={styles.benefitRow}>
            <Text style={styles.benefitLabel}>{b.label}</Text>
            <View
              style={[
                styles.statusPill,
                b.tone === 'good' && styles.statusPillGood,
                b.tone === 'muted' && styles.statusPillMuted,
                b.tone === 'active' && styles.statusPillActive,
              ]}>
              <Text
                style={[
                  styles.statusPillText,
                  b.tone === 'good' && styles.statusPillTextGood,
                  b.tone === 'muted' && styles.statusPillTextMuted,
                  b.tone === 'active' && styles.statusPillTextActive,
                ]}>
                {b.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  container: {
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 16,
    marginTop: 4,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statsCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNum: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  statLbl: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 2,
  },
  nameBlock: {
    paddingHorizontal: 18,
    marginTop: 10,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sparkle: { color: '#C4F27F', fontSize: 11 },
  memberText: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bio: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(196,242,127,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
  },
  proBadgeText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#C4F27F',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stickyWrap: {
    backgroundColor: '#000',
    paddingTop: 14,
  },
  interestsRow: {
    paddingHorizontal: 18,
    gap: 14,
  },
  interestItem: { alignItems: 'center', width: 64 },
  interestIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C4F27F',
  },
  interestEmoji: { fontSize: 22 },
  interestLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  viewTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 14,
  },
  viewTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewTabActive: {
    borderBottomColor: '#fff',
  },
  fBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: 0,
  },
  gridItem: {
    width: '33.2%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  pointsPill: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointsText: {
    color: '#C4F27F',
    fontSize: 9,
    fontWeight: '700',
  },
  listWrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  listEmoji: { fontSize: 18 },
  listTextCol: { flex: 1 },
  listTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  listSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  listRightCol: {
    alignItems: 'flex-end',
  },
  listPoints: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '700',
  },
  listWhen: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  emptyListText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 30,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeEmoji: { fontSize: 22 },
  badgeTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  badgeSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  badgeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  badgeEarned: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeProgress: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 10,
  },
  featuredWrap: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  memberBlob: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(196,242,127,0.35)',
  },
  memberTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 10,
  },
  perkPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  perkPill: {
    backgroundColor: '#C4F27F',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  perkPillText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  benefitsCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  benefitsTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  benefitLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
  },
  statusPillGood: { backgroundColor: '#C4F27F' },
  statusPillMuted: { backgroundColor: '#2a2a2a' },
  statusPillActive: { backgroundColor: '#C4F27F' },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  statusPillTextGood: { color: '#000' },
  statusPillTextMuted: { color: 'rgba(255,255,255,0.6)' },
  statusPillTextActive: { color: '#000' },
});
