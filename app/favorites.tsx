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

type Filter = 'all' | 'bars' | 'rooftops' | 'speakeasies' | 'clubs';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bars', label: 'Bars' },
  { key: 'rooftops', label: 'Rooftops' },
  { key: 'speakeasies', label: 'Speakeasies' },
  { key: 'clubs', label: 'Clubs' },
];

type Venue = {
  id: string;
  name: string;
  tag: 'ROOFTOP' | 'SPEAKEASY' | 'CLUB' | 'BAR';
  category: Filter;
  image: string;
};

const VENUES: Venue[] = [
  {
    id: '1',
    name: 'Neon Heights',
    tag: 'ROOFTOP',
    category: 'rooftops',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
  },
  {
    id: '2',
    name: 'The Velvet Bar',
    tag: 'SPEAKEASY',
    category: 'speakeasies',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
  },
  {
    id: '3',
    name: 'Circuit 01',
    tag: 'CLUB',
    category: 'clubs',
    image: 'https://images.unsplash.com/photo-1545128485-c400ce7b6892?w=400&q=80',
  },
  {
    id: '4',
    name: 'Circuit 01',
    tag: 'CLUB',
    category: 'clubs',
    image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&q=80',
  },
  {
    id: '5',
    name: 'Neon Heights',
    tag: 'ROOFTOP',
    category: 'rooftops',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80',
  },
  {
    id: '6',
    name: 'The Velvet Bar',
    tag: 'SPEAKEASY',
    category: 'speakeasies',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80',
  },
  {
    id: '7',
    name: 'Neon Heights',
    tag: 'ROOFTOP',
    category: 'rooftops',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80',
  },
  {
    id: '8',
    name: 'The Velvet Bar',
    tag: 'SPEAKEASY',
    category: 'speakeasies',
    image: 'https://images.unsplash.com/photo-1581974944026-5d6ed762f617?w=400&q=80',
  },
  {
    id: '9',
    name: 'Circuit 01',
    tag: 'CLUB',
    category: 'clubs',
    image: 'https://images.unsplash.com/photo-1602513915077-39bdc4d29f33?w=400&q=80',
  },
  {
    id: '10',
    name: 'The Velvet Bar',
    tag: 'SPEAKEASY',
    category: 'speakeasies',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80',
  },
  {
    id: '11',
    name: 'Circuit 01',
    tag: 'CLUB',
    category: 'clubs',
    image: 'https://images.unsplash.com/photo-1545128485-c400ce7b6892?w=400&q=80',
  },
  {
    id: '12',
    name: 'Neon Heights',
    tag: 'ROOFTOP',
    category: 'rooftops',
    image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&q=80',
  },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [liked, setLiked] = useState<Record<string, boolean>>(
    VENUES.reduce((acc, v) => ({ ...acc, [v.id]: true }), {}),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENUES.filter((v) => {
      if (filter !== 'all' && v.category !== filter) return false;
      if (q && !v.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

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
          placeholder="Search saved venues..."
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
        {filtered.map((v) => (
          <View key={v.id} style={styles.card}>
            <Image source={{ uri: v.image }} style={styles.cardImg} />
            <View style={styles.gradientOverlay} />
            <View style={styles.cardTagRow}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{v.tag}</Text>
              </View>
              <TouchableOpacity
                hitSlop={8}
                onPress={() =>
                  setLiked((prev) => ({ ...prev, [v.id]: !prev[v.id] }))
                }>
                <Ionicons
                  name={liked[v.id] ? 'heart' : 'heart-outline'}
                  size={18}
                  color={liked[v.id] ? '#E53935' : '#fff'}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardTitle}>{v.name}</Text>
          </View>
        ))}
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>No saved venues match.</Text>
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
