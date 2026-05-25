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
import { SectionHeader } from '@/components/section-header';
import {
  MOCK_ANALYTICS_KPIS,
  MOCK_ANALYTICS_VIEWS,
} from '@/constants/merchant-mock';

type Range = '7d' | '30d' | '90d';

const TOP_DEALS = [
  { id: '1', title: 'Happy Hour 30% Off', views: 1240, redemptions: 84, ctr: '11.6%' },
  { id: '2', title: 'Weekend Brunch BOGO', views: 540, redemptions: 32, ctr: '8.4%' },
  { id: '3', title: 'Flash: ₹200 Off Pizza', views: 188, redemptions: 11, ctr: '6.1%' },
];

export default function MerchantAnalyticsScreen() {
  const router = useRouter();
  const [range, setRange] = useState<Range>('7d');

  const maxView = Math.max(...MOCK_ANALYTICS_VIEWS.map((p) => p.value));

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
          <View style={styles.chartRow}>
            {MOCK_ANALYTICS_VIEWS.map((p) => (
              <View key={p.label} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    { height: 12 + (p.value / maxView) * 120 },
                  ]}
                />
                <Text style={styles.barLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>
              Total{' '}
              <Text style={styles.chartFooterAccent}>
                {MOCK_ANALYTICS_VIEWS.reduce((s, p) => s + p.value, 0)}
              </Text>{' '}
              views
            </Text>
            <Text style={styles.chartFooterDelta}>+22% vs prior</Text>
          </View>
        </View>

        <SectionHeader label="Key metrics" />
        <View style={styles.kpiGrid}>
          {MOCK_ANALYTICS_KPIS.map((k) => (
            <View key={k.label} style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        <SectionHeader label="Top deals" />
        <View style={styles.tableCard}>
          {TOP_DEALS.map((d, idx) => (
            <View
              key={d.id}
              style={[
                styles.tableRow,
                idx === TOP_DEALS.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <Text style={styles.rank}>#{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tableTitle}>{d.title}</Text>
                <Text style={styles.tableSub}>
                  {d.views} views · {d.redemptions} redemptions
                </Text>
              </View>
              <View style={styles.ctrPill}>
                <Text style={styles.ctrText}>{d.ctr}</Text>
              </View>
            </View>
          ))}
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
});
