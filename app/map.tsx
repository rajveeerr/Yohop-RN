import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

type MapMode = 'standard' | 'satellite';
type TopTab = 'Hot Spots' | 'Leaderboard' | 'Friends';

type Friend = {
  id: string;
  lat: number;
  lng: number;
  avatar: string;
  size: number;
  live?: boolean;
};

const FRIENDS: Friend[] = [
  {
    id: '1',
    lat: 33.876,
    lng: -84.346,
    size: 56,
    live: true,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  {
    id: '2',
    lat: 33.815,
    lng: -84.402,
    size: 64,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
  {
    id: '3',
    lat: 33.778,
    lng: -84.371,
    size: 72,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
  },
  {
    id: '4',
    lat: 33.748,
    lng: -84.421,
    size: 56,
    live: true,
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
  },
  {
    id: '5',
    lat: 33.762,
    lng: -84.302,
    size: 60,
    avatar:
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&q=80',
  },
  {
    id: '6',
    lat: 33.710,
    lng: -84.358,
    size: 60,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  },
];

const FILTER_CHIPS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'visited', label: 'Visited', icon: 'time-outline' },
  { key: 'popular', label: 'Popular', icon: 'people-outline' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
  { key: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline' },
];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B1426' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A9B7C9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1426' }] },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#BFCBDB' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#DDEAF6' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7B92' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0E2230' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1A3A4F' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#11293A' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#85B6CC' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#1F4A66' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2A6E91' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3FA0CC' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#3FA0CC' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#16364A' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5E7C92' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#04111F' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2C4E66' }],
  },
];

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [tab, setTab] = useState<TopTab>('Friends');
  const [mode, setMode] = useState<MapMode>('standard');
  const [activeChips, setActiveChips] = useState<Record<string, boolean>>({});

  const toggleChip = (k: string) =>
    setActiveChips((s) => ({ ...s, [k]: !s[k] }));

  const cycleMode = () =>
    setMode((m) => (m === 'standard' ? 'satellite' : 'standard'));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 33.79,
          longitude: -84.36,
          latitudeDelta: 0.22,
          longitudeDelta: 0.18,
        }}
        customMapStyle={DARK_MAP_STYLE}
        userInterfaceStyle="dark"
        mapType={mode === 'satellite' ? 'hybrid' : 'standard'}
        showsCompass={false}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        toolbarEnabled={false}>
        {FRIENDS.map((f) => (
          <Marker
            key={f.id}
            coordinate={{ latitude: f.lat, longitude: f.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={Platform.OS === 'ios'}>
            <View
              style={[
                styles.bubble,
                {
                  width: f.size,
                  height: f.size,
                  borderRadius: f.size / 2,
                },
                f.live && styles.bubbleLive,
              ]}>
              <Image source={{ uri: f.avatar }} style={styles.bubbleImg} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View pointerEvents="none" style={styles.vignette} />

      <SafeAreaView
        edges={['top']}
        style={styles.topOverlay}
        pointerEvents="box-none">
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
                  router.push({
                    pathname: '/hotspots',
                    params: { tab: 'Leaderboard' },
                  });
                }
              }}
              style={[styles.topTab, tab === t && styles.topTabActive]}>
              <Text
                style={[
                  styles.topTabText,
                  tab === t && styles.topTabTextActive,
                ]}>
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
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.chip, styles.chipMore]}
            activeOpacity={0.85}>
            <Ionicons name="ellipsis-horizontal" size={14} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <View style={styles.rightControls}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={cycleMode}>
          <MaterialCommunityIcons
            name={mode === 'satellite' ? 'satellite-variant' : 'map-outline'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
          <Ionicons name="speedometer-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          activeOpacity={0.85}
          onPress={() =>
            mapRef.current?.animateToRegion(
              {
                latitude: 33.79,
                longitude: -84.36,
                latitudeDelta: 0.22,
                longitudeDelta: 0.18,
              },
              500,
            )
          }>
          <Ionicons name="navigate" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomLeft}>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85}>
          <Ionicons name="search" size={16} color="#fff" />
          <View style={styles.searchDot} />
        </TouchableOpacity>
        <View style={styles.recentAvatars}>
          {FRIENDS.slice(0, 3).map((f, i) => (
            <Image
              key={f.id}
              source={{ uri: f.avatar }}
              style={[
                styles.recentAvatar,
                { marginLeft: i === 0 ? 0 : -10 },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1426' },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(8,18,34,0.78)',
    marginHorizontal: 14,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
    backgroundColor: 'rgba(0,0,0,0.65)',
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
    backgroundColor: 'rgba(8,18,34,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  bubbleLive: {
    borderColor: '#FF3D6B',
    shadowColor: '#FF3D6B',
    shadowOpacity: 0.65,
    shadowRadius: 10,
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
    backgroundColor: 'rgba(8,18,34,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(8,18,34,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
