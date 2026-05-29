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
import { useCoinTransactions } from '@/hooks/use-gamification';
import { useMyVenueClaims } from '@/hooks/use-venue-rewards';
import type {
  CoinTransaction,
  VenueRewardClaim,
} from '@/services/types';

type Status = 'used' | 'earned' | 'expired';
type Category = 'drinks' | 'points' | 'bites';

type Item = {
  id: string;
  title: string;
  venue: string;
  date: string;
  points: number;
  status: Status;
  category: Category;
  icon: keyof typeof Ionicons.glyphMap;
};

function categoryOf(tx: CoinTransaction): Category {
  if (tx.type === 'SPENT' || tx.type === 'REFUND') return 'drinks';
  if (tx.type === 'BONUS' || tx.type === 'EARNED') return 'points';
  return 'bites';
}

function iconOf(category: Category): keyof typeof Ionicons.glyphMap {
  if (category === 'drinks') return 'wine-outline';
  if (category === 'points') return 'sparkles-outline';
  return 'fast-food-outline';
}

function transactionToItem(tx: CoinTransaction): Item {
  const isSpend = tx.type === 'SPENT';
  const cat = categoryOf(tx);
  return {
    id: `tx-${tx.id}`,
    title: tx.description ?? typeLabel(tx.type),
    venue: typeLabel(tx.type),
    date: tx.createdAt,
    points: isSpend ? -Math.abs(tx.amount) : Math.abs(tx.amount),
    status: isSpend ? 'used' : 'earned',
    category: cat,
    icon: iconOf(cat),
  };
}

function claimToItem(c: VenueRewardClaim): Item {
  const reward = c.reward;
  const value = reward?.amount ?? 0;
  return {
    id: `claim-${c.id}`,
    title: reward?.name ?? 'Venue reward',
    venue: reward?.merchant?.businessName ?? 'Nearby venue',
    date: c.claimedAt,
    points: reward?.type === 'COINS' ? value : -Math.abs(value),
    status: 'used',
    category: reward?.type === 'COINS' ? 'points' : 'drinks',
    icon:
      reward?.type === 'COINS'
        ? 'sparkles-outline'
        : reward?.type === 'DISCOUNT'
        ? 'pricetag-outline'
        : 'wine-outline',
  };
}

function typeLabel(t: CoinTransaction['type']): string {
  switch (t) {
    case 'PURCHASE':
      return 'Coin purchase';
    case 'EARNED':
      return 'Points earned';
    case 'SPENT':
      return 'Points used';
    case 'BONUS':
      return 'Bonus';
    case 'REFUND':
      return 'Refund';
  }
}

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
  const { data: txns, isLoading: txLoading } = useCoinTransactions();
  const { data: claims, isLoading: claimLoading } = useMyVenueClaims();

  const items = useMemo(() => {
    const out: Item[] = [];
    (txns ?? []).forEach((t) => out.push(transactionToItem(t)));
    (claims ?? []).forEach((c) => out.push(claimToItem(c)));
    return out.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [txns, claims]);

  const filtered = useMemo(() => {
    const now = new Date();
    return items.filter((it) => {
      if (cat !== 'all' && it.category !== cat) return false;
      if (date === 'month') {
        const d = new Date(it.date);
        if (
          d.getMonth() !== now.getMonth() ||
          d.getFullYear() !== now.getFullYear()
        )
          return false;
      }
      return true;
    });
  }, [items, cat, date]);

  const totalRedeemed = items.filter((i) => i.status === 'used').length;
  const pointsUsed = items
    .filter((i) => i.status === 'used')
    .reduce((s, i) => s + Math.abs(i.points), 0);

  const grouped = filtered.reduce<Record<string, Item[]>>((acc, it) => {
    const key = monthLabel(it.date);
    (acc[key] ??= []).push(it);
    return acc;
  }, {});

  const loading = (txLoading || claimLoading) && items.length === 0;

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

        {loading ? (
          <Text style={styles.empty}>Loading history…</Text>
        ) : (
          Object.entries(grouped).map(([month, monthItems]) => (
            <View key={month} style={{ marginTop: 16 }}>
              <Text style={styles.monthHeader}>{month}</Text>
              <View style={styles.card}>
                {monthItems.map((it, idx) => {
                  const s = STATUS_STYLE[it.status];
                  const positive = it.points > 0;
                  return (
                    <View
                      key={it.id}
                      style={[
                        styles.row,
                        idx === monthItems.length - 1 && { borderBottomWidth: 0 },
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
                            {
                              color: positive
                                ? '#C4F27F'
                                : 'rgba(255,255,255,0.85)',
                            },
                          ]}>
                          {positive ? '+' : ''}
                          {it.points} pts
                        </Text>
                        <View
                          style={[styles.statusPill, { backgroundColor: s.bg }]}>
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
          ))
        )}
        {!loading && filtered.length === 0 && (
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
