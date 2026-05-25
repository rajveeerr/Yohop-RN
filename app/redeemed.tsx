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

type Status = 'used' | 'earned' | 'expired';
type Category = 'drinks' | 'points' | 'bites';

type Item = {
  id: string;
  title: string;
  venue: string;
  date: string; // ISO
  points: number;
  status: Status;
  category: Category;
  icon: keyof typeof Ionicons.glyphMap;
};

const ITEMS: Item[] = [
  {
    id: '1',
    title: 'Free Cocktail',
    venue: 'Haus Khas Social',
    date: '2026-05-22',
    points: -200,
    status: 'used',
    category: 'drinks',
    icon: 'wine-outline',
  },
  {
    id: '2',
    title: '50 Bounty Points',
    venue: 'Check-in reward',
    date: '2026-05-15',
    points: 50,
    status: 'earned',
    category: 'points',
    icon: 'sparkles-outline',
  },
  {
    id: '3',
    title: '15% off — Lord of',
    venue: 'Happy hour pass',
    date: '2026-05-08',
    points: -300,
    status: 'used',
    category: 'drinks',
    icon: 'pricetag-outline',
  },
  {
    id: '4',
    title: 'Free Starter',
    venue: 'Social — Haus Khas',
    date: '2026-04-27',
    points: -150,
    status: 'expired',
    category: 'bites',
    icon: 'fast-food-outline',
  },
  {
    id: '5',
    title: 'Double Points Weekend',
    venue: 'Rooftop bonus',
    date: '2026-04-19',
    points: 120,
    status: 'earned',
    category: 'points',
    icon: 'trending-up-outline',
  },
];

type Filter = 'all' | Category;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'points', label: 'Points' },
  { key: 'bites', label: 'Bites' },
];

type DateFilter = 'all' | 'month';
const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'month', label: 'This month' },
];

function monthLabel(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    .toUpperCase();
}

const STATUS_STYLE: Record<Status, { bg: string; fg: string; label: string }> = {
  used: { bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.7)', label: 'Used' },
  earned: { bg: 'rgba(196,242,127,0.18)', fg: '#C4F27F', label: 'Earned' },
  expired: { bg: 'rgba(229,57,53,0.18)', fg: '#E53935', label: 'Expired' },
};

export default function RedeemedScreen() {
  const router = useRouter();
  const [cat, setCat] = useState<Filter>('all');
  const [date, setDate] = useState<DateFilter>('all');

  const filtered = useMemo(() => {
    return ITEMS.filter((it) => {
      if (cat !== 'all' && it.category !== cat) return false;
      if (date === 'month') {
        const d = new Date(it.date);
        const now = new Date('2026-05-25');
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())
          return false;
      }
      return true;
    });
  }, [cat, date]);

  const totalRedeemed = ITEMS.filter((i) => i.status === 'used').length;
  const pointsUsed = ITEMS.filter((i) => i.status === 'used').reduce(
    (s, i) => s + Math.abs(i.points),
    0,
  );

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, it) => {
    const key = monthLabel(it.date);
    (acc[key] ??= []).push(it);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Redeemed</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalRedeemed}</Text>
            <Text style={styles.statLabel}>Total redeemed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#C4F27F' }]}>
              {pointsUsed.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Points Used</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {DATE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.pill, date === f.key && styles.pillActive]}
              onPress={() => setDate(f.key)}
              activeOpacity={0.85}>
              <Text
                style={[styles.pillText, date === f.key && styles.pillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.pill, cat === f.key && styles.pillActive]}
              onPress={() => setCat(f.key)}
              activeOpacity={0.85}>
              <Text style={[styles.pillText, cat === f.key && styles.pillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {Object.entries(grouped).map(([month, items]) => (
          <View key={month} style={{ marginTop: 16 }}>
            <Text style={styles.monthHeader}>{month}</Text>
            <View style={styles.card}>
              {items.map((it, idx) => {
                const s = STATUS_STYLE[it.status];
                const positive = it.points > 0;
                return (
                  <View
                    key={it.id}
                    style={[
                      styles.row,
                      idx === items.length - 1 && { borderBottomWidth: 0 },
                    ]}>
                    <View style={styles.icon}>
                      <Ionicons name={it.icon} size={16} color="#C4F27F" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{it.title}</Text>
                      <Text style={styles.itemMeta}>{it.venue}</Text>
                    </View>
                    <View style={styles.right}>
                      <Text
                        style={[
                          styles.itemPoints,
                          { color: positive ? '#C4F27F' : 'rgba(255,255,255,0.85)' },
                        ]}>
                        {positive ? '+' : ''}
                        {it.points} pts
                      </Text>
                      <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                        <Text style={[styles.statusText, { color: s.fg }]}>
                          {s.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.empty}>Nothing here for this filter.</Text>
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
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  filterRow: {
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
    alignItems: 'center',
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
  divider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  monthHeader: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  card: {
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
  icon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.25)',
  },
  itemTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  itemMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end', gap: 4 },
  itemPoints: { fontSize: 12, fontWeight: '800' },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
});
