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
import { SectionHeader } from '@/components/section-header';
import { useMe } from '@/hooks/use-auth';
import { useMerchantDealsList } from '@/hooks/use-merchant-crud';
import { useMerchantStats } from '@/hooks/use-merchant-stats';

type Range = '7d' | '30d' | '90d';

function formatCurrency(n: number | undefined): string {
  if (n === undefined) return '—';
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number | undefined, sign = true): string {
  if (n === undefined) return '—';
  const s = sign && n > 0 ? '+' : '';
  return `${s}${n.toFixed(0)}%`;
}

export default function MerchantAnalyticsScreen() {
  const router = useRouter();
  const [range, setRange] = useState<Range>('7d');
  const { data: me } = useMe();
  const merchantId = me?.merchantId ?? undefined;
  const { data: stats, isLoading: statsLoading } = useMerchantStats(merchantId);
  const { data: deals } = useMerchantDealsList(merchantId);

  const viewsData = stats?.weeklyViews ?? [];
  const maxView = Math.max(1, ...viewsData.map((p) => p.value));
  const totalViews = viewsData.reduce((s, p) => s + p.value, 0);

  const topDeals = useMemo(() => {
    return [...(deals ?? [])]
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 5);
  }, [deals]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Analytics</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.rangeRow}>
          {(['7d', '30d', '90d'] as Range[]).map((r) => (
            <TouchableOpacity
              key={r}
              activeOpacity={0.85}
              style={[styles.rangePill, range === r && styles.rangePillActive]}
              onPress={() => setRange(r)}>
              <Text
                style={[
                  styles.rangePillText,
                  range === r && styles.rangePillTextActive,
                ]}>
                {r === '7d' ? 'Last 7d' : r === '30d' ? 'Last 30d' : 'Last 90d'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader label="Profile views" />
        <View style={styles.chartCard}>
          {viewsData.length === 0 ? (
            <Text style={styles.empty}>
              {statsLoading ? 'Loading…' : 'No view data yet'}
            </Text>
          ) : (
            <>
              <View style={styles.chartRow}>
                {viewsData.map((p) => (
                  <View key={p.day} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        { height: 12 + (p.value / maxView) * 120 },
                      ]}
                    />
                    <Text style={styles.barLabel}>{p.day}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartFooter}>
                <Text style={styles.chartFooterText}>
                  Total{' '}
                  <Text style={styles.chartFooterAccent}>
                    {totalViews.toLocaleString()}
                  </Text>{' '}
                  views
                </Text>
                {stats?.checkInsDeltaPct !== undefined && (
                  <Text style={styles.chartFooterDelta}>
                    {formatPct(stats.checkInsDeltaPct)} vs prior
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        <SectionHeader label="Key metrics" />
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{formatCurrency(stats?.totalRevenue)}</Text>
            <Text style={styles.kpiLabel}>Total revenue</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>
              {stats?.totalCheckIns !== undefined
                ? stats.totalCheckIns.toLocaleString()
                : '—'}
            </Text>
            <Text style={styles.kpiLabel}>Check-ins</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>
              {stats?.avgGroupSize !== undefined
                ? stats.avgGroupSize.toFixed(1)
                : '—'}
            </Text>
            <Text style={styles.kpiLabel}>Avg group size</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>
              {stats?.conversionRate !== undefined
                ? `${stats.conversionRate.toFixed(0)}%`
                : '—'}
            </Text>
            <Text style={styles.kpiLabel}>Conversion</Text>
          </View>
        </View>

        <SectionHeader label="Top deals" />
        <View style={styles.tableCard}>
          {topDeals.length === 0 ? (
            <Text style={styles.empty}>No deals yet</Text>
          ) : (
            topDeals.map((d, idx) => {
              const views = d.viewCount ?? 0;
              const redemptions = d.currentRedemptions ?? 0;
              const ctr = views > 0 ? (redemptions / views) * 100 : 0;
              return (
                <View
                  key={d.id}
                  style={[
                    styles.tableRow,
                    idx === topDeals.length - 1 && { borderBottomWidth: 0 },
                  ]}>
                  <Text style={styles.rank}>#{idx + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tableTitle}>{d.title}</Text>
                    <Text style={styles.tableSub}>
                      {views.toLocaleString()} views · {redemptions} redemptions
                    </Text>
                  </View>
                  <View style={styles.ctrPill}>
                    <Text style={styles.ctrText}>{ctr.toFixed(1)}%</Text>
                  </View>
                </View>
              );
            })
          )}
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
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  rangePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rangePillActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  rangePillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  rangePillTextActive: { color: '#000', fontWeight: '700' },
  chartCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  bar: {
    width: 18,
    borderRadius: 4,
    backgroundColor: '#C4F27F',
  },
  barLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  chartFooterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  chartFooterAccent: {
    color: '#fff',
    fontWeight: '800',
  },
  chartFooterDelta: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  kpiValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  kpiLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rank: {
    color: '#C4F27F',
    fontSize: 13,
    fontWeight: '800',
    width: 28,
  },
  tableTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tableSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  ctrPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
  },
  ctrText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '800',
  },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
