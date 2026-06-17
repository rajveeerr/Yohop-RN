import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MerchantDrawer } from '@/components/merchant-drawer';
import { useMe } from '@/hooks/use-auth';
import { useMerchantStats } from '@/hooks/use-merchant-stats';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';

type ChartTab = 'checkins' | 'revenue' | 'views';

const EMPTY_WEEK: { day: string; value: number }[] = [
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
].map((day) => ({ day, value: 0 }));

function formatCurrency(n: number | undefined): string {
  if (n === undefined) return '—';
  return `$${n.toLocaleString()}`;
}

function formatPct(n: number | undefined, sign = true): string {
  if (n === undefined) return '—';
  const s = sign && n > 0 ? '+' : '';
  return `${s}${n.toFixed(0)}%`;
}

export default function MerchantHomeScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chartTab, setChartTab] = useState<ChartTab>('checkins');
  const profile = useStoredMerchantProfile();
  const { data: me } = useMe();
  const { data: stats } = useMerchantStats(me?.merchantId ?? undefined);

  const displayName = profile?.businessName || 'Your business';
  const firstName = me?.name?.split(' ')[0] ?? 'there';

  const data =
    (chartTab === 'checkins'
      ? stats?.weeklyCheckIns
      : chartTab === 'revenue'
      ? stats?.weeklyRevenue
      : stats?.weeklyViews) ?? EMPTY_WEEK;
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const peakIdx = data.findIndex((d) => d.value === maxVal);
  const peakDay = data[peakIdx]?.day ?? '—';
  const todayDay = new Date().toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3);
  const todayIdx = data.findIndex((d) => d.day === todayDay);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.brandRow}
          activeOpacity={0.85}
          onPress={() => setDrawerOpen(true)}>
          <View style={styles.brandLogo}>
            <View style={styles.brandDot} />
          </View>
          <View>
            <Text style={styles.brandTag}>Merchant</Text>
            <Text style={styles.brandName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={8}
            onPress={() => router.push('/merchant-analytics')}>
            <Ionicons name="stats-chart-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={8}
            onPress={() => setDrawerOpen(true)}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <MerchantDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Hey, {firstName}</Text>
        <Text style={styles.greetingSub}>
          Here’s how your venue is performing today.
        </Text>

        {stats?.liveDealTitle || stats?.liveCrowd ? (
          <View style={styles.liveRow}>
            <View style={styles.liveLeft}>
              <View style={styles.livePulseWrap}>
                <View style={styles.livePulse} />
                <View style={styles.livePulseOuter} />
              </View>
              <View>
                <Text style={styles.liveLabel}>LIVE RIGHT NOW</Text>
                <Text style={styles.liveSub}>
                  {stats?.liveDealTitle ?? 'Venue is open'}
                </Text>
              </View>
            </View>
            {stats?.liveCrowd ? (
              <View style={styles.crowdPill}>
                <Ionicons name="people" size={11} color="#000" />
                <Text style={styles.crowdText}>{stats.liveCrowd}+ crowd</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.createDealBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/merchant-deal')}>
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.createDealText}>Create Deal</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Analytics Overview</Text>
        <View style={styles.kpiGrid}>
          <KpiCard
            label="Total Revenue"
            value={formatCurrency(stats?.totalRevenue)}
            delta={
              stats?.revenueDeltaPct !== undefined
                ? `${formatPct(stats.revenueDeltaPct)} vs last mo`
                : '—'
            }
            positive={(stats?.revenueDeltaPct ?? 0) >= 0}
          />
          <KpiCard
            label="Check-ins"
            value={
              stats?.totalCheckIns !== undefined
                ? stats.totalCheckIns.toLocaleString()
                : '—'
            }
            delta={
              stats?.checkInsDeltaPct !== undefined
                ? `${formatPct(stats.checkInsDeltaPct)} vs last mo`
                : '—'
            }
            positive={(stats?.checkInsDeltaPct ?? 0) >= 0}
          />
          <KpiCard
            label="Avg Group"
            value={
              stats?.avgGroupSize !== undefined
                ? stats.avgGroupSize.toFixed(1)
                : '—'
            }
            delta={
              stats?.avgGroupDelta !== undefined
                ? `${stats.avgGroupDelta > 0 ? '+' : ''}${stats.avgGroupDelta.toFixed(1)} people`
                : '—'
            }
            positive={(stats?.avgGroupDelta ?? 0) >= 0}
          />
          <KpiCard
            label="Conv. Rate"
            value={
              stats?.conversionRate !== undefined
                ? `${(stats.conversionRate * 100).toFixed(0)}%`
                : '—'
            }
            delta={
              stats?.conversionDeltaPct !== undefined
                ? `${formatPct(stats.conversionDeltaPct)} vs last mo`
                : '—'
            }
            positive={(stats?.conversionDeltaPct ?? 0) >= 0}
          />
        </View>

        <Text style={styles.sectionTitle}>Check-ins this week</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartTabs}>
            {(['checkins', 'revenue', 'views'] as ChartTab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chartTab, chartTab === t && styles.chartTabActive]}
                onPress={() => setChartTab(t)}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.chartTabText,
                    chartTab === t && styles.chartTabTextActive,
                  ]}>
                  {t === 'checkins' ? 'Check-ins' : t === 'revenue' ? 'Revenue' : 'Views'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartBars}>
            {data.map((d, i) => {
              const isPeak = d.value === maxVal;
              const isToday = i === todayIdx;
              return (
                <View key={d.day} style={styles.chartBarCol}>
                  <View
                    style={[
                      styles.chartBar,
                      { height: 14 + (d.value / maxVal) * 110 },
                      isPeak && styles.chartBarPeak,
                      !isPeak && isToday && styles.chartBarToday,
                    ]}
                  />
                  <Text
                    style={[
                      styles.chartDayLabel,
                      (isPeak || isToday) && styles.chartDayLabelActive,
                    ]}>
                    {d.day}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            <View style={styles.chartFootItem}>
              <Text style={styles.chartFootValue}>
                {chartTab === 'revenue' ? `$${total.toLocaleString()}` : total}
              </Text>
              <Text style={styles.chartFootLabel}>
                {chartTab === 'revenue' ? 'total' : 'total'}{' '}
                <Text style={styles.chartFootMuted}>period</Text>
              </Text>
            </View>
            <View style={styles.chartFootItem}>
              <Text style={[styles.chartFootValue, { color: '#C4F27F' }]}>
                {peakDay}
              </Text>
              <Text style={styles.chartFootLabel}>
                peak <Text style={styles.chartFootMuted}>day</Text>
              </Text>
            </View>
            <View style={styles.chartFootItem}>
              <Text style={[styles.chartFootValue, { color: '#fff' }]}>—</Text>
              <Text style={styles.chartFootLabel}>Today</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Deal Performance</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(merchant)/deals')}>
            <Text style={styles.viewAllText}>View all ›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dealCard}>
          <Text style={styles.emptyText}>
            Wire merchant deals list to populate.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function KpiCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text
        style={[styles.kpiDelta, !positive && { color: '#FF6B6B' }]}>
        {delta}
      </Text>
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandLogo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4F27F',
  },
  brandTag: {
    color: '#C4F27F',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 140,
  },
  greeting: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  greetingSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 4,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  liveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  livePulseWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4F27F',
    position: 'absolute',
  },
  livePulseOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(196,242,127,0.25)',
  },
  liveLabel: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  liveSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  crowdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C4F27F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  crowdText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  createDealBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#C4F27F',
  },
  createDealText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  viewAllText: {
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
  kpiLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  kpiDelta: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  chartCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chartTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chartTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chartTabActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderColor: '#C4F27F',
  },
  chartTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  chartTabTextActive: {
    color: '#C4F27F',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 2,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBar: {
    width: 16,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chartBarPeak: {
    backgroundColor: '#C4F27F',
  },
  chartBarToday: {
    backgroundColor: 'rgba(196,242,127,0.55)',
  },
  chartDayLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '600',
  },
  chartDayLabelActive: {
    color: '#fff',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  chartFootItem: {
    alignItems: 'flex-start',
  },
  chartFootValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  chartFootLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  chartFootMuted: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
  },
  dealCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dealIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  dealMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  dealRight: {
    alignItems: 'flex-end',
  },
  dealAmount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  dealAmountSub: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
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
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  activitySub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
