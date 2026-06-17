import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@/hooks/use-location';

type TopTab = 'Hot Spots' | 'Leaderboard' | 'Friends';
type MapLayer = 'light' | 'dark' | 'satellite';

const CENTER = { lat: 40.7308, lng: -73.9869, zoom: 13 };


const FILTER_CHIPS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'visited', label: 'Visited', icon: 'time-outline' },
  { key: 'popular', label: 'Popular', icon: 'people-outline' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
  { key: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline' },
];

// Keyless Leaflet + OpenStreetMap map (works in Expo Go — no native Google Maps
// module or API key). CARTO light/dark basemaps + Esri imagery cover the three
// modes the layer toggle cycles through.
function buildMapHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #0a1428; }
    .leaflet-control-attribution { font-size: 9px; opacity: 0.5; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${CENTER.lat}, ${CENTER.lng}], ${CENTER.zoom});
    var layers = {
      light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }),
      dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '&copy; Esri' })
    };
    var current = 'light';
    layers[current].addTo(map);
    window.setLayer = function (name) {
      if (name === current || !layers[name]) return;
      map.removeLayer(layers[current]);
      layers[name].addTo(map);
      current = name;
    };
    var userMarker = null;
    var lastUser = null;
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
  const [layer, setLayer] = useState<MapLayer>('light');
  const [activeChips, setActiveChips] = useState<Record<string, boolean>>({});

  const mapHtml = useMemo(() => buildMapHtml(), []);

  const { location } = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  const centerOnUser = useCallback(() => {
    const l = locationRef.current;
    webRef.current?.injectJavaScript(
      `window.setCenter && window.setCenter(${l.latitude}, ${l.longitude}, 13); true;`,
    );
  }, []);

  useEffect(() => {
    centerOnUser();
  }, [location.latitude, location.longitude, centerOnUser]);

  const toggleChip = (k: string) =>
    setActiveChips((s) => ({ ...s, [k]: !s[k] }));

  // Cycle light → dark → satellite, driving the WebView layer via injection.
  const cycleMapType = () =>
    setLayer((l) => {
      const next: MapLayer =
        l === 'light' ? 'dark' : l === 'dark' ? 'satellite' : 'light';
      webRef.current?.injectJavaScript(
        `window.setLayer && window.setLayer('${next}'); true;`,
      );
      return next;
    });

  const recenter = () =>
    webRef.current?.injectJavaScript('window.recenter && window.recenter(); true;');

  return (
    <View style={styles.root}>
      <StatusBar barStyle={layer === 'light' ? 'dark-content' : 'light-content'} />

      <WebView
        ref={webRef}
        style={[StyleSheet.absoluteFillObject, styles.web]}
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
  web: { backgroundColor: '#0a1428' },
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