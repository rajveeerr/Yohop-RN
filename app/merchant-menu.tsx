import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import { useMerchantMenu } from '@/hooks/use-merchant';
import type { MenuItem } from '@/services/types';

function formatPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function MerchantMenuScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const merchantId = me?.merchantId ?? undefined;
  const { data: items, isLoading } = useMerchantMenu(merchantId);

  const grouped = (items ?? []).reduce<Record<string, MenuItem[]>>(
    (acc, it) => {
      const key = it.category ?? 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(it);
      return acc;
    },
    {},
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
        <Text style={styles.topTitle}>Menu Items</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {isLoading && Object.keys(grouped).length === 0 ? (
          <Text style={styles.empty}>Loading menu…</Text>
        ) : Object.keys(grouped).length === 0 ? (
          <Text style={styles.empty}>No menu items yet. Add one below.</Text>
        ) : null}
        {Object.entries(grouped).map(([cat, items]) => (
          <View key={cat} style={{ marginBottom: 14 }}>
            <Text style={styles.catLabel}>{cat}</Text>
            {items.map((it) => (
              <TouchableOpacity
                key={it.id}
                style={styles.row}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/merchant-menu-item',
                    params: { id: it.id },
                  })
                }>
                <Image
                  source={{ uri: it.image ?? undefined }}
                  style={styles.thumb}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTopRow}>
                    <Text numberOfLines={1} style={styles.rowTitle}>
                      {it.name}
                    </Text>
                    {it.isHappyHour && (
                      <View style={styles.hhPill}>
                        <Text style={styles.hhText}>HH</Text>
                      </View>
                    )}
                    {it.isSurprise && (
                      <View style={styles.surprisePill}>
                        <Ionicons name="sparkles" size={9} color="#000" />
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.rowSub}>
                    {it.description}
                  </Text>
                  <Text style={styles.rowPrice}>{formatPrice(it.price)}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/merchant-menu-item')}>
        <Ionicons name="add" size={22} color="#000" />
        <Text style={styles.fabText}>Add Item</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
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
  topTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 100,
  },
  catLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  rowTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  hhPill: {
    backgroundColor: '#FFB300',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  hhText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
  },
  surprisePill: {
    backgroundColor: '#C4F27F',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rowSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  rowPrice: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
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
