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
import { MERCHANT_BUSINESS } from '@/constants/merchant-mock';
import { useMe } from '@/hooks/use-auth';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';

type ChartTab = 'checkins' | 'revenue' | 'views';

const WEEK_DATA: Record<ChartTab, { day: string; value: number }[]> = {
  checkins: [
    { day: 'Mon', value: 28 },
    { day: 'Tue', value: 36 },
    { day: 'Wed', value: 32 },
    { day: 'Thu', value: 48 },
    { day: 'Fri', value: 74 },
    { day: 'Sat', value: 58 },
    { day: 'Sun', value: 36 },
  ],
  revenue: [
    { day: 'Mon', value: 340 },
    { day: 'Tue', value: 420 },
    { day: 'Wed', value: 390 },
    { day: 'Thu', value: 620 },
    { day: 'Fri', value: 980 },
    { day: 'Sat', value: 880 },
    { day: 'Sun', value: 650 },
  ],
  views: [
    { day: 'Mon', value: 180 },
    { day: 'Tue', value: 220 },
    { day: 'Wed', value: 240 },
    { day: 'Thu', value: 310 },
    { day: 'Fri', value: 460 },
    { day: 'Sat', value: 510 },
    { day: 'Sun', value: 380 },
  ],
};

type DealPerf = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  meta: string;
  metaTone: 'live' | 'scheduled' | 'bounty';
  amount: string;
  amountSub: string;
};

const DEAL_PERF: DealPerf[] = [
  {
    id: '1',
    icon: 'fast-food-outline',
    iconBg: 'rgba(196,242,127,0.18)',
    title: 'Taco Tuesday — 40% Off',
    meta: 'Active · Ends 10:00 PM · 9+ crowd',
    metaTone: 'live',
    amount: '$1,840',
    amountSub: '153 check-ins',
  },
  {
    id: '2',
    icon: 'wine-outline',
    iconBg: 'rgba(255,179,0,0.18)',
    title: 'VIP Rooftop Happy Hour',
    meta: 'Scheduled · Starts 10:00 PM',
    metaTone: 'scheduled',
    amount: '$220',
    amountSub: '12 booked',
  },
  {
    id: '3',
    icon: 'people-outline',
    iconBg: 'rgba(174,128,255,0.22)',
    title: 'Bring 3 Friends — $20 back',
    meta: 'Bounty · 36 redeemed',
    metaTone: 'bounty',
    amount: '$680',
    amountSub: '42 claimed',
  },
];

type RecentActivity = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  sub: string;
  time: string;
};

const RECENT: RecentActivity[] = [
  {
    id: '1',
    icon: 'sparkles',
    iconColor: '#C4F27F',
    title: 'Tony Stark checked in with 3 friends — Bounty unlocked',
    sub: '2 hours ago · South Delhi',
    time: '2h',
  },
  {
    id: '2',
    icon: 'calendar-outline',
    iconColor: '#FFB300',
    title: 'New table booking — Table #002, 4 guests at 8:00 PM',
    sub: '12 min ago',
    time: '12m',
  },
  {
    id: '3',
    icon: 'trending-up',
    iconColor: '#AE80FF',
    title: 'VIP Rooftop deal view spike — 47 views in last 30 mins',
    sub: 'just now',
    time: 'now',
  },
];

export default function MerchantHomeScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chartTab, setChartTab] = useState<ChartTab>('checkins');
  const profile = useStoredMerchantProfile();
  const { data: me } = useMe();

  const displayName = profile?.businessName || MERCHANT_BUSINESS.name;
  const firstName = me?.name?.split(' ')[0] ?? 'Yashika';

  const data = WEEK_DATA[chartTab];
  const maxVal = Math.max(...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const peakIdx = data.findIndex((d) => d.value === maxVal);
  const peakDay = data[peakIdx]?.day ?? '';
  const todayIdx = 4;

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
        <TouchableOpacity
          style={styles.iconBtn}
          hitSlop={8}
          onPress={() => setDrawerOpen(true)}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>
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

        <View style={styles.liveRow}>
          <View style={styles.liveLeft}>
            <View style={styles.livePulseWrap}>
              <View style={styles.livePulse} />
              <View style={styles.livePulseOuter} />
            </View>
            <View>
              <Text style={styles.liveLabel}>LIVE RIGHT NOW</Text>
              <Text style={styles.liveSub}>Taco Tuesday — 40% Off active</Text>
            </View>
          </View>
          <View style={styles.crowdPill}>
            <Ionicons name="people" size={11} color="#000" />
            <Text style={styles.crowdText}>9+ crowd</Text>
          </View>
        </View>

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
            value="$4,280"
            delta="+18% vs last mo"
            positive
          />
          <KpiCard
            label="Check-ins"
            value="312"
            delta="+24% vs last mo"
            positive
          />
          <KpiCard
            label="Avg Group"
            value="3.8"
            delta="+0.4 people"
            positive
          />
          <KpiCard
            label="Conv. Rate"
            value="68%"
            delta="-3% vs last mo"
            positive={false}
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
          {DEAL_PERF.map((d, idx) => (
            <View
              key={d.id}
              style={[
                styles.dealRow,
                idx === DEAL_PERF.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <View style={[styles.dealIcon, { backgroundColor: d.iconBg }]}>
                <Ionicons name={d.icon} size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.dealTitle}>
                  {d.title}
                </Text>
                <Text numberOfLines={1} style={styles.dealMeta}>
                  {d.meta}
                </Text>
              </View>
              <View style={styles.dealRight}>
                <Text style={styles.dealAmount}>{d.amount}</Text>
                <Text style={styles.dealAmountSub}>{d.amountSub}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.activityCard}>
          {RECENT.map((a, idx) => (
            <View
              key={a.id}
              style={[
                styles.activityRow,
                idx === RECENT.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <View style={styles.activityIcon}>
                <Ionicons name={a.icon} size={14} color={a.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={styles.activityTitle}>
                  {a.title}
                </Text>
                <Text style={styles.activitySub}>{a.sub}</Text>
              </View>
            </View>
          ))}
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
});
