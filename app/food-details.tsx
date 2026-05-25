import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeals } from '@/hooks/use-deals';
import { useMerchant, useMerchantMenu } from '@/hooks/use-merchant';
import type { MenuItem } from '@/services/types';

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80';
const DISH_FALLBACK =
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80';

const CATEGORY_FALLBACK = [
  'All',
  'Happy Hours',
  'Daily',
  'Kids',
  'Snacks',
  'Italian',
  'Chinese',
];

type OrderMode = 'Tab' | 'Delivery' | 'Pickup';

function timeUntil(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h ${m}m`;
  return `${h}h ${m}m`;
}

export default function FoodDetailsScreen() {
  const router = useRouter();
  const { merchantId } = useLocalSearchParams<{ merchantId?: string }>();

  const merchantQ = useMerchant(merchantId);
  const menuQ = useMerchantMenu(merchantId);
  const dealsQ = useDeals({ isActive: true });

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderMode, setOrderMode] = useState<OrderMode>('Tab');

  const merchant = merchantQ.data;
  const menu = menuQ.data ?? [];

  const title = merchant?.businessName ?? 'Premium Omakase Experience';
  const hero = merchant?.coverImage ?? merchant?.gallery?.[0] ?? HERO_FALLBACK;
  const description =
    merchant?.description ??
    'Authentic street tacos meets craft beer garden. Daily happy hours, Taco Tuesday specials, and a rooftop patio.';
  const address = merchant
    ? [merchant.address, merchant.city].filter(Boolean).join(' • ')
    : '20 miles away • East Wing, Atlanta';

  const merchantDeals = useMemo(
    () => (dealsQ.data ?? []).filter((d) => !merchantId || d.merchantId === merchantId),
    [dealsQ.data, merchantId],
  );
  const liveDeal = merchantDeals[0];
  const offerPct = liveDeal?.discountPercentage
    ? `${Math.round(liveDeal.discountPercentage)}% OFF`
    : liveDeal?.discountAmount
      ? `$${liveDeal.discountAmount} OFF`
      : '50% OFF';
  const offerTimer = timeUntil(liveDeal?.startTime) ?? '10h 32m';
  const offerSub = liveDeal?.title ?? 'Taco Tuesday • $2 Tacos All Day';

  const dealImages = useMemo(() => {
    const imgs: string[] = [];
    merchantDeals.forEach((d) => d.images?.forEach((i) => imgs.push(i)));
    if (imgs.length === 0 && merchant?.gallery?.length) {
      return merchant.gallery.slice(0, 6);
    }
    return imgs.slice(0, 6);
  }, [merchantDeals, merchant?.gallery]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menu.forEach((m) => m.category && set.add(m.category));
    const list = Array.from(set);
    return list.length > 0 ? ['All', ...list] : CATEGORY_FALLBACK;
  }, [menu]);

  const filteredMenu = useMemo<MenuItem[]>(() => {
    let items = menu;
    if (activeCategory !== 'All') {
      items = items.filter((m) => m.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.description ?? '').toLowerCase().includes(q),
      );
    }
    return items;
  }, [menu, activeCategory, query]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((s, n) => s + n, 0),
    [cart],
  );

  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

  const onBook = () =>
    router.push({
      pathname: '/book',
      params: { merchantId: merchantId ?? '', title },
    });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: hero }} style={styles.hero}>
          <View style={styles.heroTopShade} pointerEvents="none" />
          <View style={styles.heroBottomShade} pointerEvents="none" />
          <SafeAreaView edges={['top']} pointerEvents="box-none">
            <View style={styles.heroTopRow}>
              <TouchableOpacity
                style={styles.roundBtn}
                onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <View style={styles.heroTopRight}>
                <TouchableOpacity style={styles.roundBtn}>
                  <Ionicons name="share-social-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.roundBtn}>
                  <Ionicons name="search" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          <View style={styles.heroFooter}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {title}
              </Text>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>4.5</Text>
                <Ionicons name="star" size={11} color="#FFC83D" />
              </View>
            </View>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaLeft}>
                <Ionicons name="location-outline" size={12} color="#fff" />
                <Text style={styles.heroMeta}>{address}</Text>
              </View>
              <Text style={styles.heroOpen}>Open till 10PM</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={onBook}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={15}
                color="#fff"
              />
              <Text style={styles.actionText}>Book a table</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/booked')}>
              <Ionicons name="finger-print" size={15} color="#fff" />
              <Text style={styles.actionText}>Check-in Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.offerCard}>
            <View style={styles.offerHeader}>
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live Offer</Text>
              </View>
              <View style={styles.timerRow}>
                <Ionicons name="time-outline" size={11} color="#fff" />
                <Text style={styles.timerText}>Begins: {offerTimer}</Text>
              </View>
            </View>
            <Text style={styles.offerAmount}>{offerPct}</Text>
            <Text style={styles.offerSub}>{offerSub}</Text>
            <TouchableOpacity style={styles.offerCta} activeOpacity={0.85}>
              <Text style={styles.offerCtaText}>Check in Now</Text>
            </TouchableOpacity>
          </View>

          {dealImages.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={16}
                  color="#fff"
                />
                <Text style={styles.sectionTitle}>Exclusive Deals</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dealsRow}>
                {dealImages.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.dealCard}
                    activeOpacity={0.85}>
                    <Image source={{ uri }} style={styles.dealImage} />
                    <View style={styles.dealBadge}>
                      <Text style={styles.dealBadgeText}>
                        -{5 + i * 5}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={15} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for dishes"
              placeholderTextColor="#888"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                activeOpacity={0.7}
                onPress={() => setActiveCategory(c)}
                style={styles.categoryItem}>
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === c && styles.categoryTextActive,
                  ]}>
                  {c}
                </Text>
                {activeCategory === c && <View style={styles.categoryUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {menuQ.isLoading ? (
            <ActivityIndicator color="#fff" style={{ paddingVertical: 28 }} />
          ) : filteredMenu.length === 0 ? (
            <Text style={styles.empty}>
              {query
                ? 'No dishes match your search.'
                : 'No dishes available.'}
            </Text>
          ) : (
            <View style={styles.dishesGrid}>
              {filteredMenu.map((item) => (
                <DishCard
                  key={item.id}
                  item={item}
                  onAdd={() => addToCart(item.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        {cartCount > 0 && (
          <TouchableOpacity
            style={styles.cartPill}
            activeOpacity={0.9}
            onPress={() => router.push('/cart')}>
            <Text style={styles.cartText}>
              {cartCount} item{cartCount > 1 ? 's' : ''} added
            </Text>
            <View style={styles.cartRight}>
              <Text style={styles.cartView}>View Cart</Text>
              <Ionicons name="chevron-forward" size={14} color="#000" />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.modeRow}>
          {(['Tab', 'Delivery', 'Pickup'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              activeOpacity={0.85}
              onPress={() => setOrderMode(m)}
              style={[styles.modeBtn, orderMode === m && styles.modeBtnActive]}>
              <Text
                style={[
                  styles.modeText,
                  orderMode === m && styles.modeTextActive,
                ]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

function DishCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <View style={styles.dishCard}>
      <View style={styles.dishImageWrap}>
        <Image
          source={{ uri: item.image ?? DISH_FALLBACK }}
          style={styles.dishImage}
        />
        <TouchableOpacity
          style={styles.dishAdd}
          activeOpacity={0.8}
          onPress={onAdd}>
          <Ionicons name="add" size={14} color="#000" />
        </TouchableOpacity>
        <View style={styles.dishPriceTag}>
          <Text style={styles.dishPriceText}>${item.price.toFixed(2)}</Text>
        </View>
      </View>
      <Text style={styles.dishName} numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );
}

const GREEN = '#1F4F2A';
const LIME = '#C4F27F';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  hero: {
    width: '100%',
    height: 230,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  heroTopShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroBottomShade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: 8,
  },
  roundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroFooter: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  heroMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  heroMeta: { color: '#fff', fontSize: 11 },
  heroOpen: {
    color: LIME,
    fontSize: 11,
    fontWeight: '700',
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  description: {
    color: '#BFBFBF',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  actionText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  offerCard: {
    backgroundColor: GREEN,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E53935',
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timerText: { color: '#fff', fontSize: 10 },
  offerAmount: {
    color: LIME,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  offerSub: {
    color: '#D6F4B2',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  offerCta: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
  },
  offerCtaText: { color: '#000', fontSize: 12, fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dealsRow: { gap: 10, paddingRight: 18 },
  dealCard: {
    width: 110,
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  dealImage: { width: '100%', height: '100%' },
  dealBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 38,
    marginTop: 18,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 12, padding: 0 },

  categoriesRow: {
    gap: 18,
    paddingRight: 18,
    marginBottom: 12,
  },
  categoryItem: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  categoryText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500' },
  categoryTextActive: { color: '#fff', fontWeight: '700' },
  categoryUnderline: {
    marginTop: 4,
    height: 2,
    width: '80%',
    backgroundColor: LIME,
    borderRadius: 1,
  },

  empty: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 30,
  },

  dishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  dishCard: {
    width: '31.5%',
  },
  dishImageWrap: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  dishImage: { width: '100%', height: '100%' },
  dishAdd: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishPriceTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dishPriceText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dishName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 14,
  },

  bottomSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  cartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIME,
    marginHorizontal: 14,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cartText: { color: '#000', fontSize: 13, fontWeight: '700' },
  cartRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cartView: { color: '#000', fontSize: 13, fontWeight: '700' },

  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 14,
    borderRadius: 26,
    padding: 4,
    gap: 4,
    marginBottom: 6,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: '#fff' },
  modeText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: '#000' },
});
