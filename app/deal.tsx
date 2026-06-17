import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useDeal,
  useSavedDeals,
  useToggleSavedDeal,
} from '@/hooks/use-deals';
import { useMerchant, useMerchantMenu } from '@/hooks/use-merchant';


const MENU_TABS = ['Menu', 'Events', 'Catering', 'Merch', 'Ride', 'Leaders'];
const TAGS = ['Highly Recommended', 'Spicy', 'Vegan', 'Non-Veg', 'Healthy'];

function timeUntil(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h ${m}m`;
  return `${h}h ${m}m ${s}s`;
}

export default function DealScreen() {
  const router = useRouter();
  const { dealId, merchantId, id } = useLocalSearchParams<{
    dealId?: string;
    merchantId?: string;
    id?: string;
  }>();
  const resolvedDealId = dealId ?? id;

  const dealQ = useDeal(resolvedDealId);
  const merchantQ = useMerchant(merchantId ?? dealQ.data?.merchantId);
  const menuQ = useMerchantMenu(merchantId ?? dealQ.data?.merchantId);
  const savedQ = useSavedDeals();
  const toggleSaved = useToggleSavedDeal();

  const isLiked = useMemo(
    () => !!savedQ.data?.some((d) => d.id === resolvedDealId),
    [savedQ.data, resolvedDealId],
  );

  const [offerVisible, setOfferVisible] = useState(true);
  const [activeMenuTab, setActiveMenuTab] = useState('Menu');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [orderMode, setOrderMode] = useState<'Tab' | 'Delivery' | 'Pickup'>('Delivery');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const deal = dealQ.data;
  const merchant = merchantQ.data;
  const menu = menuQ.data ?? [];

  const hero = deal?.images?.[0] ?? merchant?.coverImage ?? null;
  const heroCount = deal?.images?.length ?? 1;
  const title = merchant?.businessName ?? deal?.title ?? '';
  const description = merchant?.description ?? deal?.description ?? '';
  const offerTimer = timeUntil(deal?.startTime);
  const offerPct = deal?.discountPercentage
    ? `${Math.round(deal.discountPercentage)}% OFF`
    : deal?.discountAmount
      ? `$${deal.discountAmount} OFF`
      : null;
  const location = merchant
    ? [merchant.address, merchant.city, merchant.state].filter(Boolean).join(', ')
    : '';

  const categories = useMemo(() => {
    const set = new Set<string>();
    menu.forEach((m) => m.category && set.add(m.category));
    return ['All', ...Array.from(set)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'All') return menu;
    return menu.filter((m) => m.category === activeCategory);
  }, [menu, activeCategory]);

  const topImages = deal?.images?.slice(0, 3) ?? [];

  if (dealQ.isLoading && !deal) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  if (dealQ.error && !deal) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.errorText}>
          {(dealQ.error as Error).message ?? 'Failed to load deal'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {hero ? (
            <Image source={{ uri: hero }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={40} color="rgba(0,0,0,0.2)" />
            </View>
          )}
          <SafeAreaView edges={['top']} style={styles.heroOverlay} pointerEvents="box-none">
            <View style={styles.heroTopRow}>
              <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={18} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.roundBtn}
                onPress={() => resolvedDealId && toggleSaved.mutate(resolvedDealId)}
                disabled={!resolvedDealId || toggleSaved.isPending}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isLiked ? '#E53935' : '#000'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {heroCount > 1 && (
            <View style={styles.heroDots}>
              {Array.from({ length: Math.min(heroCount, 5) }).map((_, i) => (
                <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                const mId = merchantId ?? deal?.merchantId;
                if (mId) router.push({ pathname: '/food-details', params: { merchantId: mId } });
              }}>
              <Text style={styles.title}>{title}</Text>
            </TouchableOpacity>
          </View>

          {!!description && <Text style={styles.description}>{description}</Text>}

          {!!location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/book',
                  params: {
                    merchantId: merchantId ?? deal?.merchantId ?? '',
                    title,
                  },
                })
              }>
              <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Book a table</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/checkin',
                  params: {
                    merchantId: merchantId ?? deal?.merchantId ?? '',
                    title,
                  },
                })
              }>
              <Ionicons name="finger-print" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Check-in Now</Text>
            </TouchableOpacity>
          </View>

          {offerVisible && offerPct && (
            <View style={styles.offerCard}>
              <TouchableOpacity
                style={styles.offerClose}
                onPress={() => setOfferVisible(false)}>
                <Ionicons name="close" size={14} color="#000" />
              </TouchableOpacity>
              <View style={styles.offerHeader}>
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live Offer</Text>
                </View>
                {offerTimer && (
                  <View style={styles.timerRow}>
                    <Ionicons name="time-outline" size={12} color="#333" />
                    <Text style={styles.timerText}>Begins: {offerTimer}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.offerAmount}>{offerPct}</Text>
              <Text style={styles.offerDesc}>{deal?.title ?? deal?.description}</Text>
              <TouchableOpacity style={styles.offerCta} activeOpacity={0.85}>
                <Text style={styles.offerCtaText}>Check in Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {topImages.length > 0 && (
            <>
              <View style={styles.dealsHeader}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#000" />
                <Text style={styles.dealsTitle}>Exclusive Deals</Text>
              </View>
              <View style={styles.dealsRow}>
                {topImages.map((uri, i) => (
                  <TouchableOpacity key={i} style={styles.dealCard} activeOpacity={0.85}>
                    <Image source={{ uri }} style={styles.dealImage} />
                    {offerPct && (
                      <View style={styles.dealBadge}>
                        <Text style={styles.dealBadgeText}>{offerPct}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.searchWrap}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/food-details',
                params: { merchantId: merchantId ?? deal?.merchantId ?? '' },
              })
            }>
            <Ionicons name="search" size={16} color="#888" />
            <Text style={styles.searchPlaceholder}>Search for dishes</Text>
          </TouchableOpacity>

          <View style={styles.menuTabsWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.menuTabsRow}>
              {MENU_TABS.map((t) => (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.8}
                  onPress={() => setActiveMenuTab(t)}
                  style={[
                    styles.menuTab,
                    activeMenuTab === t && styles.menuTabActive,
                  ]}>
                  <Text
                    style={[
                      styles.menuTabText,
                      activeMenuTab === t && styles.menuTabTextActive,
                    ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                activeOpacity={0.7}
                onPress={() => setActiveCategory(c)}>
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === c && styles.categoryTextActive,
                  ]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsRow}>
            {TAGS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tagChip, activeTag === t && styles.tagChipActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTag(activeTag === t ? null : t)}>
                <Text style={[styles.tagText, activeTag === t && styles.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {menuQ.isLoading ? (
            <ActivityIndicator color="#000" style={{ paddingVertical: 24 }} />
          ) : filteredMenu.length === 0 ? (
            <Text style={styles.menuEmpty}>No dishes available yet.</Text>
          ) : (
            <View style={styles.dishesGrid}>
              {filteredMenu.map((d) => (
                <View key={d.id} style={styles.dishCard}>
                  <View style={styles.dishImageWrap}>
                    {d.image ? (
                      <Image source={{ uri: d.image }} style={styles.dishImage} />
                    ) : (
                      <View style={[styles.dishImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="restaurant-outline" size={20} color="#ccc" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.dishAdd}
                      onPress={() => setCartCount((c) => c + 1)}
                      activeOpacity={0.8}>
                      <Ionicons name="add" size={18} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.dishPrice}>
                      <Text style={styles.dishPriceText}>${d.price.toFixed(2)}</Text>
                    </View>
                  </View>
                  <Text style={styles.dishName} numberOfLines={2}>
                    {d.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        {cartCount > 0 && (
          <TouchableOpacity style={styles.cartPill} activeOpacity={0.9} onPress={() => router.push('/cart')}>
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
              <Text style={[styles.modeText, orderMode === m && styles.modeTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  menuEmpty: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
  hero: {
    width: '100%',
    height: 280,
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  roundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heroDots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    width: 12,
    backgroundColor: '#fff',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#000' },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  locationText: { fontSize: 12, color: '#666', marginLeft: 4 },
  openStatus: { fontSize: 12, color: '#2BB673', fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1f3a2a',
    borderRadius: 10,
    height: 46,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  offerCard: {
    backgroundColor: '#E8F5D5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  offerClose: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 28,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
  liveText: { fontSize: 12, color: '#333', fontWeight: '500' },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: { fontSize: 11, color: '#333' },
  offerAmount: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: '#000',
    marginTop: 6,
  },
  offerDesc: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    marginTop: 2,
    marginBottom: 12,
  },
  offerCta: {
    alignSelf: 'center',
    backgroundColor: '#1f3a2a',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 18,
  },
  offerCtaText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dealsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dealsTitle: { fontSize: 15, fontWeight: '700', color: '#000' },
  dealsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dealCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  dealImage: { width: '100%', height: '100%' },
  dealBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
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
    backgroundColor: '#C4F27F',
    marginHorizontal: 14,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 10,
  },
  cartText: { color: '#000', fontSize: 14, fontWeight: '600' },
  cartRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cartView: { color: '#000', fontSize: 14, fontWeight: '700' },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: '#1f3a2a',
    borderRadius: 22,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#000',
  },
  modeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modeTextActive: { color: '#fff' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    marginTop: 18,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    padding: 0,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#888',
  },
  menuTabsWrap: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
  },
  menuTabsRow: {
    gap: 4,
    alignItems: 'center',
  },
  menuTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  menuTabActive: {
    backgroundColor: '#2e4a30',
  },
  menuTabText: { color: '#ccc', fontSize: 13, fontWeight: '500' },
  menuTabTextActive: { color: '#fff', fontWeight: '600' },
  categoriesRow: {
    gap: 14,
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 13,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  tagsRow: {
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 12,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: '#444' },
  tagChipActive: { backgroundColor: '#000', borderColor: '#000' },
  tagTextActive: { color: '#fff' },
  dishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dishCard: {
    width: '31.5%',
    marginBottom: 10,
  },
  dishImageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  dishAdd: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  dishPrice: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dishPriceText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  dishName: {
    marginTop: 6,
    fontSize: 11,
    color: '#444',
    lineHeight: 14,
  },
});
