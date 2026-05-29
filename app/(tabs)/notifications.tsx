import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDismissNudge, useNudges } from '@/hooks/use-nudges';
import type { NudgeType, RenderedNudge } from '@/services/types';

type Tab = 'All' | 'Activity' | 'Offers';

const OFFER_TYPES: NudgeType[] = ['NEARBY_DEAL', 'HAPPY_HOUR', 'SURPRISE'];

function bucketFor(type: NudgeType): 'Activity' | 'Offers' {
  return OFFER_TYPES.includes(type) ? 'Offers' : 'Activity';
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

const TYPE_LABEL: Record<NudgeType, string> = {
  INACTIVITY: 'Reminder',
  NEARBY_DEAL: 'Nearby Deal',
  STREAK: 'Streak',
  HAPPY_HOUR: 'Happy Hour Alert',
  WEATHER: 'Weather',
  SURPRISE: 'Surprise',
};

export default function NotificationsScreen() {
  const [tab, setTab] = useState<Tab>('All');
  const { data, isLoading } = useNudges();
  const dismiss = useDismissNudge();

  const filtered = useMemo(() => {
    const all = data ?? [];
    if (tab === 'All') return all;
    return all.filter((n) => bucketFor(n.type) === tab);
  }, [data, tab]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.tabsRow}>
        {(['All', 'Activity', 'Offers'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            activeOpacity={0.85}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {isLoading && filtered.length === 0 ? (
          <Text style={styles.emptyText}>Loading…</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>You&apos;re all caught up.</Text>
        ) : (
          filtered.map((n) => (
            <NotificationCard
              key={n.id}
              n={n}
              onDismiss={() => dismiss.mutate(n.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationCard({
  n,
  onDismiss,
}: {
  n: RenderedNudge;
  onDismiss: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={onDismiss}
      style={styles.card}>
      <NotificationIcon n={n} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{n.title || TYPE_LABEL[n.type]}</Text>
        {n.body ? <Text style={styles.cardText}>{n.body}</Text> : null}
      </View>
      <Text style={styles.cardTime}>{formatRelative(n.createdAt)}</Text>
    </TouchableOpacity>
  );
}

function NotificationIcon({ n }: { n: RenderedNudge }) {
  if (n.imageUrl) {
    return <Image source={{ uri: n.imageUrl }} style={styles.thumb} />;
  }
  if (n.iconUrl) {
    return (
      <View style={styles.iconWrap}>
        <Image source={{ uri: n.iconUrl }} style={styles.avatar} />
      </View>
    );
  }
  const icon = ICON_FOR_TYPE[n.type];
  return (
    <View style={[styles.iconWrap, styles.bookingIcon]}>
      <Ionicons name={icon} size={20} color="#C4F27F" />
    </View>
  );
}

const ICON_FOR_TYPE: Record<NudgeType, keyof typeof Ionicons.glyphMap> = {
  INACTIVITY: 'time-outline',
  NEARBY_DEAL: 'pricetag-outline',
  STREAK: 'flame-outline',
  HAPPY_HOUR: 'wine-outline',
  WEATHER: 'partly-sunny-outline',
  SURPRISE: 'gift-outline',
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  tabActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  tabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000',
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 110,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconWrap: {
    position: 'relative',
    width: 42,
    height: 42,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  bookingIcon: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    paddingTop: 2,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 17,
  },
  cardTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 60,
  },
});
