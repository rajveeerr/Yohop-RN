import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe } from '@/hooks/use-auth';
import { useDeals, useNearbyDeals } from '@/hooks/use-deals';
import { useLeaderboard, useMyRank } from '@/hooks/use-leaderboard';
import { useLocation } from '@/hooks/use-location';
import type { Deal, LeaderboardEntry } from '@/services/types';

type Tab = 'Hot Spots' | 'Leaderboard' | 'Bounties';

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=900&q=80';
const ROW_FALLBACK =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&q=80';

function makeFallbackDeals(now: number): Deal[] {
  const inMs = (mins: number) => new Date(now + mins * 60_000).toISOString();
  return [
    {
      id: 'demo-1',
      merchantId: 'm-1',
      merchant: {
        id: 'm-1',
        businessName: 'The Dead Rabbit',
        logo: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=200&q=80',
        address: '30 Water St',
        city: 'New York',
        latitude: 40.7033,
        longitude: -74.012,
      },
      title: 'Free Drink',
      description: 'If you check in within the limited time for happy hours',
      discountPercentage: null,
      discountAmount: null,
      startTime: null,
      endTime: inMs(45),
      images: [
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80',
      ],
      isActive: true,
      isBounty: false,
      bountyReward: null,
      isFlashSale: true,
      currentRedemptions: 57,
      maxRedemptions: 200,
    },
    {
      id: 'demo-2',
      merchantId: 'm-2',
      merchant: {
        id: 'm-2',
        businessName: 'Death & Co.',
        logo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=200&q=80',
        address: '433 E 6th St',
        city: 'East Village',
        latitude: 40.7251,
        longitude: -73.9836,
      },
      title: '$2 cocktails',
      description: 'Half off well drinks',
      discountAmount: 2,
      discountPercentage: null,
      startTime: null,
      endTime: inMs(45),
      images: [],
      isActive: true,
      isBounty: false,
      bountyReward: null,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
    {
      id: 'demo-3',
      merchantId: 'm-3',
      merchant: {
        id: 'm-3',
        businessName: 'Attaboy',
        logo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=200&q=80',
        address: '134 Eldridge St',
        city: 'Lower East Side',
        latitude: 40.7197,
        longitude: -73.9912,
      },
      title: 'Last call special',
      description: 'Ending soon',
      discountAmount: null,
      discountPercentage: null,
      startTime: null,
      endTime: inMs(20),
      images: [],
      isActive: true,
      isBounty: false,
      bountyReward: null,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
    {
      id: 'demo-4',
      merchantId: 'm-4',
      merchant: {
        id: 'm-4',
        businessName: 'Employees Only',
        logo: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80',
        address: '510 Hudson St',
        city: 'West Village',
        latitude: 40.7338,
        longitude: -74.0056,
      },
      title: '$2 cocktails',
      description: 'Off-menu specials',
      discountAmount: 2,
      discountPercentage: null,
      startTime: null,
      endTime: inMs(45),
      images: [],
      isActive: true,
      isBounty: false,
      bountyReward: null,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
    {
      id: 'demo-5',
      merchantId: 'm-5',
      merchant: {
        id: 'm-5',
        businessName: 'The Aviary',
        logo: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200&q=80',
        address: '955 W Fulton Market',
        city: 'Chicago',
        latitude: 41.886,
        longitude: -87.6573,
      },
      title: 'Last call special',
      description: 'Ending soon',
      discountAmount: null,
      discountPercentage: null,
      startTime: null,
      endTime: inMs(15),
      images: [],
      isActive: true,
      isBounty: false,
      bountyReward: null,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
    {
      id: 'demo-6',
      merchantId: 'm-6',
      merchant: {
        id: 'm-6',
        businessName: 'Trick Dog',
        logo: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=200&q=80',
        address: '3010 20th St',
        city: 'San Francisco',
        latitude: 37.759,
        longitude: -122.413,
      },
      title: '$2 cocktails',
      description: 'House cocktails',
      discountAmount: 2,
      discountPercentage: null,
      startTime: null,
      endTime: null,
      images: [],
      isActive: true,
      isBounty: false,
      bountyReward: null,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
  ];
}

function makeFallbackBounties(now: number): Deal[] {
  const inMs = (mins: number) => new Date(now + mins * 60_000).toISOString();
  return [
    {
      id: 'b-1',
      merchantId: 'm-7',
      merchant: {
        id: 'm-7',
        businessName: 'Bar Goto',
        logo: null,
        address: '245 Eldridge St',
        city: 'New York',
        latitude: 40.722,
        longitude: -73.991,
      },
      title: 'Refer a friend',
      description: 'Get $20 when a friend checks in',
      discountAmount: null,
      discountPercentage: null,
      startTime: null,
      endTime: inMs(120),
      images: [],
      isActive: true,
      isBounty: true,
      bountyReward: 20,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
    {
      id: 'b-2',
      merchantId: 'm-8',
      merchant: {
        id: 'm-8',
        businessName: 'Maison Premiere',
        logo: null,
        address: '298 Bedford Ave',
        city: 'Brooklyn',
        latitude: 40.715,
        longitude: -73.961,
      },
      title: 'First-timer reward',
      description: '$15 bounty for new check-ins',
      discountAmount: null,
      discountPercentage: null,
      startTime: null,
      endTime: inMs(180),
      images: [],
      isActive: true,
      isBounty: true,
      bountyReward: 15,
      isFlashSale: false,
      currentRedemptions: null,
      maxRedemptions: null,
    },
  ];
}

function formatHms(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function useCountdown(endTime?: string | null): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!endTime) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  if (!endTime) return '00:00:00';
  return formatHms(new Date(endTime).getTime() - now);
}

export default function HotspotsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab: Tab =
    params.tab === 'Leaderboard'
      ? 'Leaderboard'
      : params.tab === 'Bounties'
        ? 'Bounties'
        : 'Hot Spots';
  const [tab, setTab] = useState<Tab>(initialTab);

  const { location } = useLocation();
  const nearby = useNearbyDeals({
    latitude: location.latitude,
    longitude: location.longitude,
    radius: 50,
  });
  const bounties = useDeals({ isBounty: true, isActive: true });
  const leaderboard = useLeaderboard('week');

  const nowRef = useMemo(() => Date.now(), []);
  const fallbackDeals = useMemo(() => makeFallbackDeals(nowRef), [nowRef]);
  const fallbackBounties = useMemo(() => makeFallbackBounties(nowRef), [nowRef]);

  const hotSpotsData =
    nearby.data && nearby.data.length > 0 ? nearby.data : fallbackDeals;
  const bountiesData =
    bounties.data && bounties.data.length > 0 ? bounties.data : fallbackBounties;
  const bountyCount = bountiesData.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.tabsRow}>
        {(['Hot Spots', 'Leaderboard', 'Bounties'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            activeOpacity={0.85}
            style={styles.tabBtn}
            onPress={() => setTab(t)}>
            <View style={styles.tabLabelRow}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t}
              </Text>
              {t === 'Bounties' && bountyCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{bountyCount}</Text>
                </View>
              )}
            </View>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {tab === 'Hot Spots' && (
          <HotSpotsView
            deals={hotSpotsData}
            loading={nearby.isLoading && !hotSpotsData.length}
            error={null}
            onPressDeal={(d) =>
              router.push({
                pathname: '/deal',
                params: { dealId: d.id, merchantId: d.merchantId },
              })
            }
          />
        )}

        {tab === 'Leaderboard' && (
          <LeaderboardView
            data={leaderboard.data ?? []}
            loading={leaderboard.isLoading}
            onFind={() => router.push('/hotspots')}
          />
        )}

        {tab === 'Bounties' && (
          <BountiesView
            deals={bountiesData}
            loading={bounties.isLoading && !bountiesData.length}
            onPressDeal={(d) =>
              router.push({
                pathname: '/deal',
                params: { dealId: d.id, merchantId: d.merchantId },
              })
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HotSpotsView({
  deals,
  loading,
  error,
  onPressDeal,
}: {
  deals: Deal[];
  loading: boolean;
  error: Error | null;
  onPressDeal: (d: Deal) => void;
}) {
  const [featured, ...rest] = deals;

  if (loading && deals.length === 0) {
    return <ActivityIndicator color="#C4F27F" style={{ marginTop: 30 }} />;
  }
  if (error && !featured) {
    return <Text style={styles.empty}>{error.message}</Text>;
  }
  if (!featured) {
    return <Text style={styles.empty}>No hot spots near you</Text>;
  }

  return (
    <View>
      <FeaturedCard deal={featured} onPress={() => onPressDeal(featured)} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MORE NEAR YOU</Text>
        <View style={styles.sectionRight}>
          <SectionPill label="City" />
          <SectionPill label="Categories" />
        </View>
      </View>

      {rest.map((d) => (
        <DealRow key={d.id} deal={d} onPress={() => onPressDeal(d)} />
      ))}
    </View>
  );
}

const BOUNTY_FILTERS = ['Cafes', 'Bars', 'Rooftops', 'Clubs'];

const BOUNTY_FALLBACK: {
  id: string;
  name: string;
  area: string;
  miles: number;
  tag: string;
}[] = [
  { id: 'b1', name: 'PCO Bar', area: 'Manhattan', miles: 0.3, tag: '$5 Craft Beers' },
  { id: 'b2', name: 'Liquid Karma', area: 'Williamsburg', miles: 0.3, tag: 'BOGO Drink' },
  { id: 'b3', name: 'Skyline Heights', area: 'Midtown', miles: 0.3, tag: 'Exclusive' },
];

function BountiesView({
  deals,
  loading,
  onPressDeal,
}: {
  deals: Deal[];
  loading: boolean;
  onPressDeal: (d: Deal) => void;
}) {
  const rows =
    deals.length > 0
      ? deals.map((d) => ({
          id: d.id,
          name: d.merchant?.businessName ?? d.title,
          area: d.merchant?.city ?? '',
          miles: 0.3,
          tag:
            d.bountyReward != null
              ? `$${Math.round(d.bountyReward)} Bounty`
              : (d.title ?? 'Exclusive'),
          deal: d,
        }))
      : BOUNTY_FALLBACK.map((b) => ({ ...b, deal: null as Deal | null }));

  return (
    <View style={{ paddingHorizontal: 14, paddingTop: 14 }}>
      <Text style={styles.bountyHeader}>Active Bounties</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bountyFiltersRow}>
        <View style={[styles.filterPill, styles.filterPillCount]}>
          <Text style={styles.filterPillCountText}>{rows.length} nearby</Text>
        </View>
        <FilterPill label="City" />
        {BOUNTY_FILTERS.map((f) => (
          <View key={f} style={styles.filterPill}>
            <Text style={styles.filterPillText}>{f}</Text>
          </View>
        ))}
      </ScrollView>

      {loading && rows.length === 0 ? (
        <ActivityIndicator color="#C4F27F" style={{ marginTop: 30 }} />
      ) : (
        <View style={{ marginTop: 12 }}>
          {rows.map((r) => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.85}
              style={styles.bountyRow}
              onPress={() => r.deal && onPressDeal(r.deal)}>
              <View style={styles.bountyAvatar}>
                <View style={styles.bountyAvatarDot} />
              </View>
              <View style={styles.bountyTextCol}>
                <Text style={styles.bountyName}>{r.name}</Text>
                <Text style={styles.bountySub}>
                  {r.area}{r.area && ' · '}{r.miles} mi away
                </Text>
              </View>
              <View style={styles.bountyRight}>
                <BountyCountdown deal={r.deal ?? undefined} />
                <View style={styles.bountyTag}>
                  <Text style={styles.bountyTagText}>{r.tag}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.searchMoreRow} activeOpacity={0.8}>
            <View style={styles.searchMoreIcon}>
              <Ionicons name="add" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchMoreTitle}>Search for more</Text>
              <Text style={styles.searchMoreSub}>Share your live location</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function BountyCountdown({ deal }: { deal?: Deal }) {
  const fallback = useMemo(() => new Date(Date.now() + 45 * 60_000).toISOString(), []);
  const text = useCountdown(deal?.endTime ?? fallback);
  return <Text style={styles.bountyCountdown}>{text}</Text>;
}

function FeaturedCard({ deal, onPress }: { deal: Deal; onPress: () => void }) {
  const countdown = useCountdown(deal.endTime);
  const checkedIn = deal.currentRedemptions ?? 0;
  const hero = deal.images?.[0] ?? deal.merchant?.logo ?? HERO_FALLBACK;
  const title = deal.merchant?.businessName ?? deal.title;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <ImageBackground
        source={{ uri: hero }}
        style={styles.featured}
        imageStyle={styles.featuredImg}>
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredTopRow}>
          {checkedIn > 0 && (
            <View style={styles.checkedInPill}>
              <Text style={styles.checkedInText}>{checkedIn} checked in</Text>
            </View>
          )}
          <View style={styles.hottestPill}>
            <View style={styles.hottestDot} />
            <Text style={styles.hottestText}>Hottest right now</Text>
          </View>
        </View>

        <View style={styles.featuredBody}>
          <Text style={styles.featuredTitle}>{title}</Text>
          <Text style={styles.featuredRating}>
            4.8 <Ionicons name="star" size={11} color="#fff" />
          </Text>
          <TouchableOpacity style={styles.seeDealBtn} activeOpacity={0.85} onPress={onPress}>
            <Text style={styles.seeDealText}>See Deal</Text>
          </TouchableOpacity>

          <View style={styles.featuredBottomRow}>
            <View style={styles.featuredOfferBox}>
              <Text style={styles.featuredOfferTitle}>
                {deal.title.length > 14 ? 'Free Drink' : deal.title}
              </Text>
              <Text style={styles.featuredOfferSub}>
                {deal.description ??
                  'If you check in within the limited time for happy hours'}
              </Text>
            </View>
            <View style={[styles.featuredOfferBox, styles.featuredCountdownBox]}>
              <Text style={styles.featuredCountdown}>{countdown}</Text>
              <Text style={styles.featuredCountdownLabel}>LIMITED TIME</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

function DealRow({ deal, onPress }: { deal: Deal; onPress: () => void }) {
  const countdown = useCountdown(deal.endTime);
  const expiringSoon =
    !!deal.endTime &&
    new Date(deal.endTime).getTime() - Date.now() < 60 * 60 * 1000;
  const tag = expiringSoon
    ? 'Ending soon!'
    : deal.discountAmount
      ? `$${Math.round(deal.discountAmount)} off`
      : deal.title.length > 14
        ? 'Special offer'
        : deal.title;

  const thumb = deal.images?.[0] ?? deal.merchant?.logo ?? ROW_FALLBACK;
  const title = deal.merchant?.businessName ?? deal.title;
  const sub = deal.merchant?.city
    ? `${deal.merchant.city}`
    : (deal.description ?? '');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.row}
      onPress={onPress}>
      <Image source={{ uri: thumb }} style={styles.rowImg} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!sub && (
          <Text style={styles.rowSub} numberOfLines={1}>
            Bar · {sub}
          </Text>
        )}
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowCountdown}>{countdown}</Text>
        <View
          style={[
            styles.rowTag,
            expiringSoon ? styles.rowTagAlert : styles.rowTagOffer,
          ]}>
          <Text
            style={[
              styles.rowTagText,
              expiringSoon ? styles.rowTagTextAlert : styles.rowTagTextOffer,
            ]}>
            {tag}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SectionPill({ label }: { label: string }) {
  return (
    <TouchableOpacity style={styles.sectionPill} activeOpacity={0.85}>
      <Text style={styles.sectionPillText}>{label}</Text>
      <Ionicons name="chevron-down" size={11} color="#fff" />
    </TouchableOpacity>
  );
}

const FALLBACK_LB: { name: string; venue: string; checkIns: number }[] = [
  { name: 'Riya', venue: 'The Dead Rabbit', checkIns: 9 },
  { name: 'Aryan', venue: 'Death & Co.', checkIns: 7 },
  { name: 'Meera', venue: 'Attaboy', checkIns: 6 },
];

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function LeaderboardView({
  data,
  loading,
  onFind,
}: {
  data: LeaderboardEntry[];
  loading: boolean;
  onFind: () => void;
}) {
  const { data: me } = useMe();
  const { data: myRank } = useMyRank('week');

  const rows =
    data.length > 0
      ? data.slice(0, 3).map((e, i) => ({
          name: e.name,
          venue: '',
          checkIns: e.points,
          rank: e.rank ?? i + 1,
        }))
      : FALLBACK_LB.map((e, i) => ({ ...e, rank: i + 1 }));

  const max = Math.max(...rows.map((r) => r.checkIns), 1);
  const myCheckIns = myRank?.points ?? 3;
  const myRankNum = myRank?.rank ?? 7;
  const meName = me?.name?.split(' ')[0] ?? 'Guest';

  return (
    <View style={styles.lbWrap}>
      <Text style={styles.lbHeader}>HAPPY HOURS CHECK IN</Text>

      <View style={styles.lbFiltersRow}>
        <FilterPill label="Everyone" />
        <FilterPill label="City" />
        <FilterPill label="Tonight" plain />
      </View>

      {loading && data.length === 0 && rows.length === 0 ? (
        <ActivityIndicator color="#C4F27F" style={{ marginTop: 30 }} />
      ) : (
        <>
          {rows.map((r) => (
            <View key={r.rank} style={styles.lbRowCard}>
              <Text style={styles.lbMedal}>{MEDALS[r.rank] ?? `#${r.rank}`}</Text>
              <View style={styles.lbAvatar} />
              <View style={styles.lbTextCol}>
                <Text style={styles.lbName}>{r.name}</Text>
                {!!r.venue && <Text style={styles.lbVenue}>{r.venue}</Text>}
                <View style={styles.lbBarTrack}>
                  <View
                    style={[
                      styles.lbBarFill,
                      { width: `${(r.checkIns / max) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.lbRightCol}>
                <Text style={styles.lbCheckIns}>{r.checkIns}</Text>
                <Text style={styles.lbCheckInsLabel}>check ins</Text>
              </View>
            </View>
          ))}

          <View style={[styles.lbRowCard, styles.lbRowMe]}>
            <Text style={styles.lbRankBadge}>#{myRankNum}</Text>
            <View style={styles.lbAvatar} />
            <View style={styles.lbTextCol}>
              <Text style={styles.lbNameMe}>You · {meName}</Text>
              <Text style={styles.lbVenue}>At home not checked in</Text>
              <View style={styles.lbBarTrack}>
                <View
                  style={[
                    styles.lbBarFillMe,
                    { width: `${Math.min(100, (myCheckIns / max) * 100)}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.lbRightCol}>
              <Text style={styles.lbCheckInsMe}>{myCheckIns}</Text>
              <Text style={styles.lbCheckInsLabelMe}>Tonight</Text>
            </View>
          </View>

          <View style={styles.lbCta}>
            <Text style={styles.lbCtaText}>
              Check in at happy hours to climb the leaderboard
            </Text>
            <TouchableOpacity
              style={styles.lbCtaBtn}
              activeOpacity={0.9}
              onPress={onFind}>
              <Text style={styles.lbCtaBtnText}>Find Happy Hours Near Me</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function FilterPill({ label, plain }: { label: string; plain?: boolean }) {
  return (
    <TouchableOpacity style={styles.filterPill} activeOpacity={0.85}>
      <Text style={styles.filterPillText}>{label}</Text>
      {!plain && <Ionicons name="chevron-down" size={11} color="#fff" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 6,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tabBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  tabUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: '#C4F27F',
    borderRadius: 1,
    marginTop: 8,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C4F27F',
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  scroll: {
    paddingBottom: 110,
  },
  empty: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 30,
  },
  featured: {
    height: 320,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImg: {
    borderRadius: 16,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  checkedInPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C4F27F',
  },
  checkedInText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  hottestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hottestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E53935',
  },
  hottestText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  featuredBody: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  featuredRating: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  seeDealBtn: {
    backgroundColor: '#C4F27F',
    borderRadius: 22,
    paddingVertical: 11,
    alignItems: 'center',
  },
  seeDealText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  featuredBottomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  featuredOfferBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  featuredOfferTitle: {
    color: '#C4F27F',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  featuredOfferSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    lineHeight: 12,
  },
  featuredCountdownBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(229,57,53,0.6)',
  },
  featuredCountdown: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredCountdownLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionRight: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#141414',
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rowImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  rowText: { flex: 1 },
  rowTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rowSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowCountdown: {
    color: '#E53935',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  rowTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rowTagOffer: { backgroundColor: 'rgba(196,242,127,0.15)' },
  rowTagAlert: { backgroundColor: 'rgba(229,57,53,0.18)' },
  rowTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rowTagTextOffer: { color: '#C4F27F' },
  rowTagTextAlert: { color: '#E53935' },
  lbWrap: { paddingHorizontal: 14, paddingTop: 12 },
  lbHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  lbFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  lbRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196,242,127,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.18)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 10,
  },
  lbRowMe: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  lbMedal: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  lbRankBadge: {
    width: 28,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  lbAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  lbTextCol: { flex: 1 },
  lbName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  lbNameMe: {
    color: '#C4F27F',
    fontSize: 13,
    fontWeight: '700',
  },
  lbVenue: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 1,
  },
  lbBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    overflow: 'hidden',
  },
  lbBarFill: {
    height: '100%',
    backgroundColor: '#C4F27F',
    borderRadius: 2,
  },
  lbBarFillMe: {
    height: '100%',
    backgroundColor: 'rgba(196,242,127,0.5)',
    borderRadius: 2,
  },
  lbRightCol: {
    alignItems: 'flex-end',
    minWidth: 56,
  },
  lbCheckIns: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  lbCheckInsLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    marginTop: 1,
  },
  lbCheckInsMe: {
    color: '#C4F27F',
    fontSize: 16,
    fontWeight: '800',
  },
  lbCheckInsLabelMe: {
    color: '#C4F27F',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  lbCta: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  lbCtaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  lbCtaBtn: {
    backgroundColor: '#C4F27F',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  lbCtaBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  bountyHeader: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  bountyFiltersRow: {
    gap: 6,
    paddingRight: 12,
  },
  filterPillCount: {
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderColor: 'rgba(196,242,127,0.4)',
  },
  filterPillCountText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  bountyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bountyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    position: 'relative',
  },
  bountyAvatarDot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#C4F27F',
    borderWidth: 1.5,
    borderColor: '#141414',
  },
  bountyTextCol: { flex: 1 },
  bountyName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  bountySub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 2,
  },
  bountyRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  bountyCountdown: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bountyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.15)',
  },
  bountyTagText: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '700',
  },
  searchMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  searchMoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchMoreTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchMoreSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
});
