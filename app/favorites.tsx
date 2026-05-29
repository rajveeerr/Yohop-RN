import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavedDeals, useToggleSavedDeal } from '@/hooks/use-deals';
import type { Deal } from '@/services/types';

type Filter = 'all' | 'flash' | 'bounty' | 'standard';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'flash', label: 'Flash Sale' },
  { key: 'bounty', label: 'Bounty' },
  { key: 'standard', label: 'Standard' },
];

function tagFor(d: Deal): { label: string; key: Filter } {
  if (d.isFlashSale) return { label: 'FLASH', key: 'flash' };
  if (d.isBounty) return { label: 'BOUNTY', key: 'bounty' };
  return { label: 'DEAL', key: 'standard' };
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80';

export default function FavoritesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading } = useSavedDeals();
  const toggle = useToggleSavedDeal();

  const deals = data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      const t = tagFor(d).key;
      if (filter !== 'all' && t !== filter) return false;
      if (q) {
        const hay = `${d.title} ${d.merchant?.businessName ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [deals, query, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={16}
          color="rgba(255,255,255,0.5)"
          style={{ marginLeft: 14 }}
        />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search saved deals..."
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.filterPillText,
                filter === f.key && styles.filterPillTextActive,
              ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}>
        {isLoading && filtered.length === 0 ? (
          <Text style={styles.emptyText}>Loading…</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            {deals.length === 0 ? 'No saved deals yet.' : 'No saved deals match.'}
          </Text>
        ) : (
          filtered.map((d) => {
            const t = tagFor(d);
            const img = d.images?.[0] ?? FALLBACK_IMG;
            const title = d.merchant?.businessName ?? d.title;
            return (
              <TouchableOpacity
                key={d.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({ pathname: '/deal', params: { id: d.id } })
                }>
                <Image source={{ uri: img }} style={styles.cardImg} />
                <View style={styles.gradientOverlay} />
                <View style={styles.cardTagRow}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{t.label}</Text>
                  </View>
                  <TouchableOpacity
                    hitSlop={8}
                    onPress={() => toggle.mutate(d.id)}>
                    <Ionicons name="heart" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {title}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    backgroundColor: '#141414',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: '#fff',
  },
  filtersRow: {
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 8,
    paddingBottom: 40,
  },
  card: {
    width: '31.5%',
    aspectRatio: 0.95,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#141414',
    justifyContent: 'space-between',
  },
  cardImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 6,
  },
  tagPill: {
    backgroundColor: '#C4F27F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    padding: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowRadius: 4,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
    width: '100%',
  },
});
