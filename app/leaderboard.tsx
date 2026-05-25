import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistoryItem = {
  id: string;
  venue: string;
  meta: string;
  points: number;
};

const HISTORY: HistoryItem[] = [
  { id: '1', venue: 'PCO Bar', meta: 'Last night, 10:30 PM', points: 15 },
  { id: '2', venue: 'The Piano Man', meta: 'Friday, 11:45 PM', points: 20 },
  { id: '3', venue: 'PCO Bar', meta: 'Last night, 10:30 PM', points: 15 },
  { id: '4', venue: 'The Piano Man', meta: 'Friday, 11:45 PM', points: 20 },
  { id: '5', venue: 'The Piano Man', meta: 'Friday, 11:45 PM', points: 20 },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const progress = 8 / 15;

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
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>TOTAL CHECK-INS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5 days</Text>
            <Text style={styles.statLabel}>CURRENT STREAK</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Leaderboard Progress</Text>
          <View style={styles.rankRow}>
            <Text style={styles.rankLabel}>Rank #7</Text>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 4 Elite</Text>
            <Text style={styles.levelCount}>8 / 15 check-ins</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressNote}>
            7 more check-ins to reach Level 5
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.historyCard}>
          {HISTORY.map((h, idx) => (
            <View
              key={h.id}
              style={[
                styles.historyRow,
                idx === HISTORY.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <View style={styles.historyThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyVenue}>{h.venue}</Text>
                <Text style={styles.historyMeta}>{h.meta}</Text>
              </View>
              <View style={styles.pointsPill}>
                <Text style={styles.pointsText}>+{h.points} pts</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.85}>
          <Text style={styles.loadMoreText}>Load more history</Text>
        </TouchableOpacity>

        <View style={styles.specialCard}>
          <View style={styles.specialPill}>
            <Text style={styles.specialPillText}>WEEKEND SPECIAL</Text>
          </View>
          <Text style={styles.specialTitle}>Double points at all Rooftops</Text>
          <View style={styles.specialFooter}>
            <Ionicons name="flash" size={12} color="#C4F27F" />
            <Text style={styles.specialFooterText}>Active for 48h</Text>
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
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  progressCard: {
    marginTop: 14,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  progressTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 12,
  },
  rankRow: { marginBottom: 10 },
  rankLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  levelCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#C4F27F',
  },
  progressNote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  historyThumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  historyVenue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  historyMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  pointsPill: {
    backgroundColor: '#C4F27F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pointsText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  loadMoreBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  specialCard: {
    marginTop: 22,
    backgroundColor: 'rgba(196,242,127,0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.3)',
  },
  specialPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#C4F27F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  specialPillText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  specialTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  specialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  specialFooterText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
});
