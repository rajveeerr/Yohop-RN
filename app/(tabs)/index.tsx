import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image as RNImage,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { useNearbyDeals } from '@/hooks/use-deals';
import { useEvents } from '@/hooks/use-events';
import { useLocation } from '@/hooks/use-location';
import type { Deal, PlatformEvent } from '@/services/types';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

type FeedItem = {
  id: string;
  images: string[];
  thumb: string;
  title: string;
  views: string;
  likes: string;
  off?: string;
  timer?: string;
  startTime?: string | null;
  endTime?: string | null;
  location: string;
  bounty: string;
  deal: string;
  checkins: string[];
  checkinCount: number;
  kind: 'deal' | 'event';
  raw: Deal | PlatformEvent;
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80';
const EVENT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80';


function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeUntil(dateStr: string | null): string | undefined {
  if (!dateStr) return undefined;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return undefined;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h ${m}m`;
  return `${h}h ${m}m`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Live mm:ss (or h:mm:ss) string for a remaining-seconds count. */
function formatCountdown(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function dealToFeedItem(d: Deal): FeedItem {
  const images = d.images && d.images.length > 0 ? d.images : [PLACEHOLDER];
  const merchantName = d.merchant?.businessName ?? d.title;
  const loc =
    d.merchant?.address && d.merchant?.city
      ? `${d.merchant.address}, ${d.merchant.city}`
      : d.merchant?.city ?? 'Nearby';
  return {
    id: d.id,
    kind: 'deal',
    images,
    thumb: d.merchant?.logo ?? images[0],
    title: merchantName,
    views: formatNumber(d.viewCount ?? 0),
    likes: formatNumber(d.likeCount ?? 0),
    off: d.discountPercentage ? `${Math.round(d.discountPercentage)}% OFF` : undefined,
    timer: timeUntil(d.startTime),
    startTime: d.startTime,
    endTime: d.endTime,
    location: loc,
    bounty: d.isBounty && d.bountyReward ? `$${Math.round(d.bountyReward)}` : '',
    deal: d.description ?? d.title,
    checkins: [],
    checkinCount: d.currentRedemptions ?? 0,
    raw: d,
  };
}

function eventToFeedItem(e: PlatformEvent): FeedItem {
  const images =
    e.images && e.images.length > 0
      ? e.images
      : e.coverImage
        ? [e.coverImage]
        : [EVENT_PLACEHOLDER];
  const loc =
    e.venue && e.city ? `${e.venue} • ${e.city}` : (e.venue ?? e.city ?? 'Venue TBD');
  return {
    id: e.id,
    kind: 'event',
    images,
    thumb: e.merchant?.logo ?? images[0],
    title: e.title,
    views: '—',
    likes: '—',
    location: loc,
    bounty: '',
    deal: 'See More',
    checkins: [],
    checkinCount: 0,
    raw: e,
  };
}

const FILTERS = ['Events', 'Bars', 'Retail'];


export default function ExploreScreen() {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { location } = useLocation();
  const isEvents = activeFilter === 'Events';
  const dealsQuery = useNearbyDeals({
    latitude: location.latitude,
    longitude: location.longitude,
    radius: 50,
  });
  const eventsQuery = useEvents({ upcoming: true });

  const loading = isEvents ? eventsQuery.isLoading : dealsQuery.isLoading;
  const refreshing = isEvents ? eventsQuery.isRefetching : dealsQuery.isRefetching;
  const onRefresh = () => isEvents ? eventsQuery.refetch() : dealsQuery.refetch();

  const feed: FeedItem[] = useMemo(() => {
    if (isEvents) {
      return (eventsQuery.data ?? []).map(eventToFeedItem);
    }
    const deals = (dealsQuery.data ?? []).map(dealToFeedItem);
    if (activeFilter === 'All') return deals;
    return deals.filter((f) =>
      f.deal.toLowerCase().includes(activeFilter.toLowerCase()),
    );
  }, [isEvents, activeFilter, dealsQuery.data, eventsQuery.data]);

  const toggleLike = (id: string) =>
    setLiked((s) => ({ ...s, [id]: !s[id] }));
  const toggleFollow = (id: string) =>
    setFollowed((s) => ({ ...s, [id]: !s[id] }));
  const toggleExpand = (id: string) =>
    setExpanded((s) => ({ ...s, [id]: !s[id] }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {loading && feed.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#C4F27F" />
        </View>
      ) : !loading && feed.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="location-outline" size={48} color="rgba(255,255,255,0.2)" />
          <Text style={[styles.centeredText, { marginTop: 16 }]}>
            No deals near you right now.{'\n'}Check back soon!
          </Text>
        </View>
      ) : (
        <FlatList
          data={feed}
          extraData={activeFilter}
          keyExtractor={(it) => it.id}
          pagingEnabled
          snapToInterval={SCREEN_H}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C4F27F" />}
          renderItem={({ item }) => (
            <FeedCard
              item={item}
              liked={!!liked[item.id]}
              followed={!!followed[item.id]}
              expanded={!!expanded[item.id]}
              onLike={() => toggleLike(item.id)}
              onFollow={() => toggleFollow(item.id)}
              onExpand={() => toggleExpand(item.id)}
            />
          )}
        />
      )}

      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.filterChip, styles.filterAll]}
              activeOpacity={0.8}
              onPress={() => setFiltersOpen((o) => !o)}>
              <Ionicons
                name="options-outline"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.filterText}>All</Text>
            </TouchableOpacity>
            {!filtersOpen && activeFilter !== 'All' && (
              <TouchableOpacity
                style={[styles.filterChip, styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter('All')}>
                <Text style={[styles.filterText, styles.filterTextActive]}>
                  {activeFilter}
                </Text>
                <Ionicons
                  name="close"
                  size={14}
                  color="#000"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
            {filtersOpen &&
              FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    activeFilter === f && styles.filterChipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setActiveFilter(f);
                    setFiltersOpen(false);
                  }}>
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === f && styles.filterTextActive,
                    ]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
          <View style={styles.topRight}>
            <TouchableOpacity style={styles.greenPill} activeOpacity={0.8} onPress={() => Alert.alert('Location Filter', 'Location-based filtering coming soon.')}>
              <Ionicons name="location" size={14} color="#000" />
              <Ionicons name="chevron-down" size={12} color="#000" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenRound} activeOpacity={0.8} onPress={() => router.push('/(tabs)/explore' as never)}>
              <Ionicons name="search" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeedCard({
  item,
  liked,
  followed,
  expanded,
  onLike,
  onFollow,
  onExpand,
}: {
  item: FeedItem;
  liked: boolean;
  followed: boolean;
  expanded: boolean;
  onLike: () => void;
  onFollow: () => void;
  onExpand: () => void;
}) {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);

  const nowMs = Date.now();
  const startMs = item.startTime ? new Date(item.startTime).getTime() : null;
  const endMs = item.endTime ? new Date(item.endTime).getTime() : null;
  const isLive =
    item.kind === 'deal' &&
    startMs != null &&
    endMs != null &&
    startMs <= nowMs &&
    endMs > nowMs;

  return (
    <View style={styles.card}>
      <FlatList
        data={item.images}
        keyExtractor={(uri, i) => `${item.id}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
        }
        renderItem={({ item: uri }) => (
          <RNImage source={{ uri }} style={styles.cardImage} resizeMode="cover" />
        )}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.55, 1]}
        style={styles.bottomScrim}
        pointerEvents="none"
      />
      <View style={styles.sideActions}>
        <TouchableOpacity style={styles.sideButton} onPress={onLike} activeOpacity={0.8}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#E53935' : '#fff'}
          />
        </TouchableOpacity>
        <Text style={styles.sideLabel}>{item.likes}</Text>

        <TouchableOpacity style={[styles.sideButton, { marginTop: 14 }]}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.sideLabel}>Share</Text>

        {!!item.bounty && !isLive && <BlinkingBounty bounty={item.bounty} />}

        <View style={styles.thumbWrap}>
          {!!item.off && (
            <View style={styles.thumbLabel}>
              <Text style={styles.thumbLabelText}>{item.off}</Text>
            </View>
          )}
          <RNImage source={{ uri: item.thumb }} style={styles.thumbImage} />
        </View>

        <View style={styles.dots}>
          {item.images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === imageIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {isLive && (
        <View style={styles.countdownWrap} pointerEvents="none">
          {!!item.bounty && <BountyTag bounty={item.bounty} />}
          <CountdownGauge startTime={item.startTime!} endTime={item.endTime!} />
          {item.checkins.length > 0 && <CheckinTag avatars={item.checkins} />}
        </View>
      )}

      <View style={styles.bottomWrap}>
        <View style={styles.bottomContent}>
          <View style={styles.titleRow}>
            <View style={styles.avatar} />
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.viewsChip}>
              <Ionicons name="eye-outline" size={14} color="#fff" />
              <Text style={styles.viewsText}>{item.views}</Text>
            </View>
            {item.off && (
              <View style={styles.offBadge}>
                <Text style={styles.offText}>{item.off}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.buyBtn}
              activeOpacity={0.8}
              onPress={() => {
                if (item.kind === 'event') {
                  router.push({ pathname: '/event', params: { id: item.id, title: item.title } });
                } else {
                  router.push({
                    pathname: '/deal',
                    params: { dealId: item.id, merchantId: (item.raw as Deal).merchantId },
                  });
                }
              }}>
              <Text style={styles.buyText}>{item.kind === 'event' ? 'View' : 'Buy'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookBtn}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/book',
                  params:
                    item.kind === 'event'
                      ? {
                          type: 'event',
                          eventId: item.id,
                          title: item.title,
                          image: item.images[0],
                        }
                      : {
                          dealId: item.id,
                          merchantId: (item.raw as Deal).merchantId,
                          title: item.title,
                        },
                })
              }>
              <Text style={styles.bookText}>Book</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.followBtn, followed && styles.followBtnActive]}
              activeOpacity={0.8}
              onPress={onFollow}>
              <Text style={[styles.followText, followed && styles.followTextActive]}>
                {followed ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {item.kind === 'deal' && item.timer && (
            <View style={styles.badgesRow}>
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={12} color="#2BB673" />
                <Text style={styles.timerText}>Begins : {item.timer}</Text>
              </View>
            </View>
          )}

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <TouchableOpacity style={styles.dealRow} activeOpacity={0.7} onPress={onExpand}>
            <Text style={styles.dealText}>{item.deal}</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#fff"
            />
          </TouchableOpacity>
          {expanded && (
            <Text style={styles.dealDetail}>
              {item.kind === 'event'
                ? 'Live performance with special guest artists. Grab your tickets before they sell out.'
                : "Enjoy exclusive savings during our happy hours. Tap Book or Buy to grab this deal before it's gone."}
            </Text>
          )}
          <View style={styles.progressBar}>
            {item.images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  i === imageIndex && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function BlinkingBounty({ bounty }: { bounty: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.bountyWrap, { opacity }]}>
      <View style={styles.bountyBadge}>
        <Text style={styles.bountyValue}>{bounty}</Text>
        <Text style={styles.bountyLabel}>Bounty</Text>
      </View>
    </Animated.View>
  );
}

/** Bounty reward shown to the left of the live countdown gauge. */
function BountyTag({ bounty }: { bounty: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.bountyTag, { opacity }]}>
      <Text style={styles.bountyTagValue}>{bounty}</Text>
      <Text style={styles.bountyTagLabel}>BOUNTY</Text>
    </Animated.View>
  );
}

/** Stacked check-in avatars shown to the right of the live countdown gauge. */
function CheckinTag({ avatars }: { avatars: string[] }) {
  return (
    <View style={styles.checkinTag}>
      <View style={styles.avatarStack}>
        {avatars.slice(0, 3).map((uri, i) => (
          <RNImage
            key={uri}
            source={{ uri }}
            style={[styles.checkinAvatar, i > 0 && { marginLeft: -12 }]}
          />
        ))}
      </View>
      <Text style={styles.checkinLabel}>CHECKING-IN</Text>
    </View>
  );
}

const GAUGE_W = 172;
const GAUGE_H = 104;
const GAUGE_CX = GAUGE_W / 2;
const GAUGE_CY = 92; // baseline near the bottom so the dome sits on top
const GAUGE_TICKS = 32;
const GAUGE_OUTER_R = 76;
const GAUGE_INNER_R = 64;
const GAUGE_LIME = '#C4F27F';

/**
 * A live, depleting semicircular countdown gauge. Lit ticks recede from the
 * right edge as time runs out; the mm:ss readout re-renders every second.
 */
function CountdownGauge({ startTime, endTime }: { startTime: string; endTime: string }) {
  const startMs = useMemo(() => new Date(startTime).getTime(), [startTime]);
  const endMs = useMemo(() => new Date(endTime).getTime(), [endTime]);
  const totalMs = Math.max(1, endMs - startMs);
  const totalMin = Math.max(1, Math.round(totalMs / 60_000));

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Gentle breathing pulse on the arc so it reads as "live" between ticks.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  const remainingMs = Math.max(0, endMs - now);
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs));
  const remainingSec = Math.ceil(remainingMs / 1000);
  const litCount = Math.round(fraction * GAUGE_TICKS);

  const sweep = 180; // top half-circle
  const startAngle = 180; // left, sweeping clockwise over the top to the right

  const ticks = [];
  for (let i = 0; i < GAUGE_TICKS; i++) {
    const angle = ((startAngle + (sweep / (GAUGE_TICKS - 1)) * i) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const lit = i < litCount;
    ticks.push(
      <Line
        key={i}
        x1={GAUGE_CX + GAUGE_INNER_R * cos}
        y1={GAUGE_CY + GAUGE_INNER_R * sin}
        x2={GAUGE_CX + GAUGE_OUTER_R * cos}
        y2={GAUGE_CY + GAUGE_OUTER_R * sin}
        stroke={lit ? GAUGE_LIME : 'rgba(255,255,255,0.16)'}
        strokeWidth={lit ? 3 : 2}
        strokeLinecap="round"
      />,
    );
  }

  return (
    <View style={styles.gaugeBox}>
      <Animated.View style={{ opacity: ringOpacity }}>
        <Svg width={GAUGE_W} height={GAUGE_H}>
          {ticks}
        </Svg>
      </Animated.View>
      <View style={styles.gaugeCenter} pointerEvents="none">
        <Text style={styles.gaugeEndsIn}>ENDS IN</Text>
        <Text style={styles.gaugeTime}>{formatCountdown(remainingSec)}</Text>
        <Text style={styles.gaugeTotal}>of {totalMin} min</Text>
      </View>
    </View>
  );
}

const DARK = 'rgba(0,0,0,0.55)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  centeredText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    width: SCREEN_W,
    height: SCREEN_H,
    backgroundColor: '#000',
  },
  cardImage: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_H * 0.45,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  filtersScroll: {
    flex: 1,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: DARK,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  filterAll: {
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  filterText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#000', fontWeight: '600' },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: '#C4F27F',
  },
  greenRound: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideActions: {
    position: 'absolute',
    right: 12,
    top: SCREEN_H * 0.32,
    alignItems: 'center',
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  bountyWrap: { marginTop: 14 },
  bountyBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bountyValue: { color: '#C4F27F', fontSize: 13, fontWeight: '700', lineHeight: 14 },
  bountyLabel: { color: '#C4F27F', fontSize: 8, fontWeight: '600' },
  thumbWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  thumbLabel: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  thumbLabelText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  thumbImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 10,
  },
  countdownWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: SCREEN_H * 0.30,
    height: GAUGE_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bountyTag: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bountyTagValue: {
    color: GAUGE_LIME,
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bountyTagLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: -2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  checkinTag: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkinLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  gaugeBox: {
    width: GAUGE_W,
    height: GAUGE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
  },
  gaugeEndsIn: {
    color: GAUGE_LIME,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gaugeTime: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  gaugeTotal: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 1,
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
    paddingHorizontal: 14,
  },
  bottomContent: {},
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  viewsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: { color: '#fff', fontSize: 12, marginRight: 8 },
  followBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  followBtnActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  followText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  followTextActive: { color: '#000', fontWeight: '600' },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkinAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: '#333',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C4F27F',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  offBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2BB673',
  },
  timerText: { color: '#2BB673', fontSize: 11, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: { color: '#fff', fontSize: 12 },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealText: { color: '#fff', fontSize: 12, opacity: 0.9 },
  dealDetail: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.85,
    marginTop: 6,
    lineHeight: 15,
    maxWidth: '90%',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
    width: '92%',
  },
  progressSegment: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
  },
  progressSegmentActive: {
    backgroundColor: '#fff',
    height: 3,
  },
  bookBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  buyBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buyText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
