import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useLocation } from '@/hooks/use-location';

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

// Center on Atlanta (matches the seed/demo data region).
const CENTER = { lat: 33.79, lng: -84.36, zoom: 12 };

/**
 * Leaflet + OpenStreetMap map rendered inside a WebView. This is keyless and
 * works in Expo Go (no native Google Maps module / API key required). The dark
 * CARTO basemap keeps the app's dark theme; Esri imagery backs satellite mode.
 * The friend markers are Leaflet divIcons styled to match the old native pins.
 */
function buildMapHtml(friends: Friend[]): string {
  const friendsJson = JSON.stringify(friends);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #0B1426; }
    .friend { border: 2px solid #fff; border-radius: 50%; overflow: hidden; background: #000; box-shadow: 0 2px 6px rgba(0,0,0,0.45); }
    .friend.live { border-color: #FF3D6B; box-shadow: 0 0 10px rgba(255,61,107,0.65); }
    .friend img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .leaflet-control-attribution { font-size: 9px; opacity: 0.5; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var FRIENDS = ${friendsJson};
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${CENTER.lat}, ${CENTER.lng}], ${CENTER.zoom});
    var layers = {
      standard: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO'
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, attribution: '&copy; Esri'
      })
    };
    var current = 'standard';
    layers[current].addTo(map);
    FRIENDS.forEach(function (f) {
      var html = '<div class="friend' + (f.live ? ' live' : '') + '" style="width:' + f.size + 'px;height:' + f.size + 'px;"><img src="' + f.avatar + '" /></div>';
      var icon = L.divIcon({ html: html, className: '', iconSize: [f.size, f.size], iconAnchor: [f.size / 2, f.size / 2] });
      L.marker([f.lat, f.lng], { icon: icon }).addTo(map);
    });
    window.setLayer = function (name) {
      if (name === current || !layers[name]) return;
      map.removeLayer(layers[current]);
      layers[name].addTo(map);
      current = name;
    };
    var userMarker = null;
    var lastUser = null;
    // Centers the map on the device location and drops/updates a "you" marker.
    window.setCenter = function (lat, lng, zoom) {
      lastUser = [lat, lng];
      map.setView([lat, lng], zoom || map.getZoom());
      if (userMarker) { userMarker.setLatLng([lat, lng]); }
      else {
        userMarker = L.circleMarker([lat, lng], {
          radius: 8, color: '#fff', weight: 2, fillColor: '#C4F27F', fillOpacity: 1
        }).addTo(map);
      }
    };
    window.recenter = function () {
      if (lastUser) map.setView(lastUser, 14);
      else map.setView([${CENTER.lat}, ${CENTER.lng}], ${CENTER.zoom});
    };
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const router = useRouter();
  const webRef = useRef<WebView | null>(null);
  const [tab, setTab] = useState<TopTab>('Friends');
  const [mode, setMode] = useState<MapMode>('standard');
  const [activeChips, setActiveChips] = useState<Record<string, boolean>>({});

  const { location } = useLocation();
  // Keep latest coords in a ref so onLoadEnd (which fires once) always centers
  // on the freshest location even if GPS resolves after the WebView mounts.
  const locationRef = useRef(location);
  locationRef.current = location;

  // Built once — map state (layer/center) is driven via injectJavaScript so the
  // WebView never needs to reload.
  const mapHtml = useMemo(() => buildMapHtml(FRIENDS), []);

  const centerOnUser = useCallback(() => {
    const l = locationRef.current;
    webRef.current?.injectJavaScript(
      `window.setCenter && window.setCenter(${l.latitude}, ${l.longitude}, 13); true;`,
    );
  }, []);

  // Re-center whenever the resolved device location changes.
  useEffect(() => {
    centerOnUser();
  }, [location.latitude, location.longitude, centerOnUser]);

  const toggleChip = (k: string) =>
    setActiveChips((s) => ({ ...s, [k]: !s[k] }));

  const cycleMode = () =>
    setMode((m) => {
      const next: MapMode = m === 'standard' ? 'satellite' : 'standard';
      webRef.current?.injectJavaScript(
        `window.setLayer && window.setLayer('${next}'); true;`,
      );
      return next;
    });

  const recenter = () =>
    webRef.current?.injectJavaScript('window.recenter && window.recenter(); true;');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <WebView
        ref={webRef}
        style={[StyleSheet.absoluteFill, styles.web]}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
        onLoadEnd={centerOnUser}
      />

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
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => Alert.alert('Speed Tracking', 'Live speed tracking is coming soon.')}>
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
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85} onPress={() => router.push('/(tabs)/explore' as never)}>
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
  web: { backgroundColor: '#0B1426' },
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
