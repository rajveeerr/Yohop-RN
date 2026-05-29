import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { MerchantDrawer } from '@/components/merchant-drawer';
import { MerchantTopBar } from '@/components/merchant-top-bar';
import { useMe } from '@/hooks/use-auth';
import { useMerchantDealsList } from '@/hooks/use-merchant-crud';
import type { Deal } from '@/services/types';

type Filter = 'all' | 'active' | 'flash' | 'inactive';

export default function MerchantDealsScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const { data: me } = useMe();
  const { data: deals, isLoading } = useMerchantDealsList(
    me?.merchantId ?? undefined,
  );

  const filtered = (deals ?? []).filter((d) => {
    if (filter === 'active') return d.isActive;
    if (filter === 'flash') return d.isFlashSale;
    if (filter === 'inactive') return !d.isActive;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MerchantTopBar title="Deals" onMenu={() => setDrawerOpen(true)} />
      <MerchantDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {(['all', 'active', 'flash', 'inactive'] as Filter[]).map((k) => (
          <TouchableOpacity
            key={k}
            style={[styles.filterPill, filter === k && styles.filterPillActive]}
            onPress={() => setFilter(k)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.filterPillText,
                filter === k && styles.filterPillTextActive,
              ]}>
              {k === 'all'
                ? 'All'
                : k === 'active'
                ? 'Active'
                : k === 'flash'
                ? 'Flash'
                : 'Inactive'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {filtered.map((d) => (
          <DealCard
            key={d.id}
            deal={d}
            onPress={() =>
              router.push({ pathname: '/merchant-deal', params: { id: d.id } })
            }
          />
        ))}
        {isLoading && filtered.length === 0 && (
          <Text style={styles.emptyText}>Loading deals…</Text>
        )}
        {!isLoading && filtered.length === 0 && (
          <Text style={styles.emptyText}>
            {deals?.length === 0 ? 'No deals yet' : 'No deals match this filter'}
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/merchant-deal')}>
        <Ionicons name="add" size={22} color="#000" />
        <Text style={styles.fabText}>New Deal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function DealCard({ deal, onPress }: { deal: Deal; onPress: () => void }) {
  const discountLabel =
    deal.discountPercentage != null
      ? `${deal.discountPercentage}% off`
      : deal.discountAmount != null
      ? `₹${deal.discountAmount} off`
      : 'Special';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}>
      <Image
        source={{ uri: deal.images[0] }}
        style={styles.cardImg}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.discountPill}>
            <Text style={styles.discountText}>{discountLabel}</Text>
          </View>
          {deal.isFlashSale && (
            <View style={styles.flashPill}>
              <Ionicons name="flash" size={10} color="#000" />
              <Text style={styles.flashText}>Flash</Text>
            </View>
          )}
          {!deal.isActive && (
            <View style={styles.inactivePill}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle}>{deal.title}</Text>
        <Text numberOfLines={2} style={styles.cardSub}>
          {deal.description}
        </Text>
        <View style={styles.cardMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.metaText}>{deal.viewCount ?? 0}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="heart-outline" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.metaText}>{deal.likeCount ?? 0}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="ticket-outline" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.metaText}>
              {deal.currentRedemptions ?? 0}
              {deal.maxRedemptions ? `/${deal.maxRedemptions}` : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  filterRow: {
    paddingHorizontal: 14,
    gap: 8,
    paddingVertical: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  filterPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 140,
    gap: 12,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardImg: { width: '100%', height: 130 },
  cardBody: { padding: 14 },
  cardTopRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  discountPill: {
    backgroundColor: '#C4F27F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  discountText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  flashPill: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    backgroundColor: '#FFB300',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  flashText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  inactivePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
  },
  inactiveText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  cardSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
  fab: {
    position: 'absolute',
    bottom: 92,
    right: 18,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
});
