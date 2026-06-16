import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { MapType, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type TopTab = 'Hot Spots' | 'Leaderboard' | 'Friends';

const INITIAL_REGION = {
  latitude: 40.7308,
  longitude: -73.9869,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};


const FILTER_CHIPS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'visited', label: 'Visited', icon: 'time-outline' },
  { key: 'popular', label: 'Popular', icon: 'people-outline' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
  { key: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline' },
];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e87' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3a4762' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [tab, setTab] = useState<TopTab>('Friends');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [dark, setDark] = useState(false);
  const [activeChips, setActiveChips] = useState<Record<string, boolean>>({});

  const toggleChip = (k: string) =>
    setActiveChips((s) => ({ ...s, [k]: !s[k] }));

  const cycleMapType = () => {
    if (!dark && mapType === 'standard') {
      setDark(true);
    } else if (dark && mapType === 'standard') {
      setDark(false);
      setMapType('satellite');
    } else {
      setMapType('standard');
    }
  };

  const recenter = () => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 600);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle={dark || mapType === 'satellite' ? 'light-content' : 'dark-content'} />

      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        mapType={mapType}
        customMapStyle={dark && mapType === 'standard' ? DARK_MAP_STYLE : []}
        showsCompass={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}>
      </MapView>

      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.tabsBar}>
          {(['Hot Spots', 'Leaderboard', 'Friends'] as TopTab[]).map((t) => (
            <TouchableOpacity
              key={t}
              activeOpacity={0.85}
              onPress={() => {
                setTab(t);
                if (t === 'Hot Spots') {
                  router.push('/hotspots');
                } else if (t === 'Leaderboard') {
                  router.push({ pathname: '/hotspots', params: { tab: 'Leaderboard' } });
                } else if (t === 'Friends') {
                  router.push('/friends');
                }
              }}
              style={[styles.topTab, tab === t && styles.topTabActive]}>
              <Text style={[styles.topTabText, tab === t && styles.topTabTextActive]}>
                {t}
              </Text>
              {t === 'Friends' && (
                <View style={styles.friendsBadge}>
                  <Text style={styles.friendsBadgeText}>4</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {FILTER_CHIPS.map((c) => {
            const active = !!activeChips[c.key];
            return (
              <TouchableOpacity
                key={c.key}
                activeOpacity={0.85}
                onPress={() => toggleChip(c.key)}
                style={[styles.chip, active && styles.chipActive]}>
                <Ionicons
                  name={c.icon}
                  size={12}
                  color={active ? '#000' : '#fff'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={[styles.chip, styles.chipMore]} activeOpacity={0.85}>
            <Ionicons name="ellipsis-horizontal" size={14} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <View style={styles.rightControls}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={cycleMapType}>
          <MaterialCommunityIcons name="satellite-variant" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => Alert.alert('Speed Tracking', 'Live speed tracking is coming soon.')}
        >
          <Ionicons name="speedometer-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          activeOpacity={0.85}
          onPress={recenter}>
          <Ionicons name="navigate" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomLeft}>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85} onPress={() => router.push('/friends' as never)}>
          <Ionicons name="search" size={16} color="#fff" />
          <View style={styles.searchDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1428' },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginHorizontal: 14,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginTop: 6,
  },
  topTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 6,
  },
  topTabActive: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  topTabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  topTabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  friendsBadge: {
    backgroundColor: '#C4F27F',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800',
  },
  chipsRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000',
  },
  chipMore: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bubble: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  bubbleImg: {
    width: '100%',
    height: '100%',
  },
  rightControls: {
    position: 'absolute',
    right: 12,
    bottom: 130,
    gap: 10,
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fabPrimary: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  bottomLeft: {
    position: 'absolute',
    left: 14,
    bottom: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchDot: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4F27F',
  },
  recentAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
});