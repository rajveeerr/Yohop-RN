import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFriends,
  useFriendRequests,
  useRespondFriendRequest,
} from '@/hooks/use-friends';

type Tab = 'all' | 'requests' | 'suggested';

type Friend = {
  id: string;
  name: string;
  points?: number;
  mutuals: number;
  online?: boolean;
  venue?: string;
  avatarColor: string;
  status: 'friend' | 'request' | 'suggested';
  friendshipId?: number;
};

const AVATAR_COLORS = ['#C4F27F', '#7FB2F2', '#F2A65A', '#E57FB2', '#9B8CFF', '#5AD1C2'];

// No "suggested" endpoint yet — stable empty reference keeps useMemo deps clean.
const NO_SUGGESTED: Friend[] = [];

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatPoints(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K pts`;
  return `${n} pts`;
}

export default function FriendsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const { data: friendsData } = useFriends();
  const { data: requestsData } = useFriendRequests();
  const respond = useRespondFriendRequest();

  const friends: Friend[] = useMemo(
    () =>
      (friendsData ?? []).map((u, i) => ({
        id: `f-${u.id}`,
        name: u.name ?? 'Friend',
        points: u.points ?? 0,
        mutuals: 0,
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        status: 'friend' as const,
      })),
    [friendsData],
  );
  const requests: Friend[] = useMemo(
    () =>
      (requestsData ?? []).map((r, i) => ({
        id: `r-${r.friendshipId}`,
        name: r.name ?? 'User',
        mutuals: 0,
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        status: 'request' as const,
        friendshipId: r.friendshipId,
      })),
    [requestsData],
  );
  const suggested = NO_SUGGESTED;
  const onlineNow = friends.filter((f) => f.online);
  const allFriends = friends.filter((f) => !f.online);

  const accept = (f: Friend) =>
    f.friendshipId && respond.mutate({ id: f.friendshipId, action: 'accept' });
  const ignore = (f: Friend) =>
    f.friendshipId && respond.mutate({ id: f.friendshipId, action: 'ignore' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list: Friend[] = [];
    if (tab === 'all') list = friends;
    if (tab === 'requests') list = requests;
    if (tab === 'suggested') list = suggested;
    if (q) list = list.filter((f) => f.name.toLowerCase().includes(q));
    return list;
  }, [tab, query, friends, requests, suggested]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Friends</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/contacts')}>
          <Text style={styles.addLink}>+ Add</Text>
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
          placeholder="Search friends..."
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'all' && styles.tabActive]}
          onPress={() => setTab('all')}
          activeOpacity={0.85}>
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
            All ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'requests' && styles.tabActive]}
          onPress={() => setTab('requests')}
          activeOpacity={0.85}>
          <Text
            style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>
            Requests {requests.length > 0 ? requests.length : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'suggested' && styles.tabActive]}
          onPress={() => setTab('suggested')}
          activeOpacity={0.85}>
          <Text
            style={[styles.tabText, tab === 'suggested' && styles.tabTextActive]}>
            Suggested
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {tab === 'all' && !query && onlineNow.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Online Now</Text>
            <View style={styles.card}>
              {onlineNow.map((f, idx) => (
                <View
                  key={f.id}
                  style={[
                    styles.row,
                    idx === onlineNow.length - 1 && { borderBottomWidth: 0 },
                  ]}>
                  <View style={styles.avatarWrap}>
                    <View
                      style={[styles.avatar, { backgroundColor: f.avatarColor }]}>
                      <Text style={styles.avatarText}>{initials(f.name)}</Text>
                    </View>
                    <View style={styles.onlineDot} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{f.name}</Text>
                    <Text style={styles.meta}>{f.venue}</Text>
                  </View>
                  <Text style={styles.points}>
                    {formatPoints(f.points ?? 0)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'all' && !query && requests.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTab('requests')}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {requests.slice(0, 1).map((f) => (
                <View key={f.id} style={[styles.row, { borderBottomWidth: 0 }]}>
                  <View
                    style={[styles.avatar, { backgroundColor: f.avatarColor }]}>
                    <Text style={styles.avatarText}>{initials(f.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{f.name}</Text>
                    <Text style={styles.meta}>{f.mutuals} mutual friends</Text>
                  </View>
                  <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85} onPress={() => accept(f)}>
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ignoreBtn}
                    activeOpacity={0.85}
                    onPress={() => ignore(f)}>
                    <Text style={styles.ignoreText}>Ignore</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'all' && (
          <>
            <Text style={styles.sectionTitle}>All Friends</Text>
            <View style={styles.card}>
              {(query
                ? friends.filter((f) =>
                    f.name.toLowerCase().includes(query.trim().toLowerCase()),
                  )
                : allFriends
              ).map((f, idx, arr) => (
                <View
                  key={f.id}
                  style={[
                    styles.row,
                    idx === arr.length - 1 && { borderBottomWidth: 0 },
                  ]}>
                  <View
                    style={[styles.avatar, { backgroundColor: f.avatarColor }]}>
                    <Text style={styles.avatarText}>{initials(f.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{f.name}</Text>
                    <Text style={styles.meta}>
                      {f.mutuals} mutual friend{f.mutuals === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <TouchableOpacity hitSlop={10}>
                    <Ionicons
                      name="ellipsis-vertical"
                      size={16}
                      color="rgba(255,255,255,0.4)"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'requests' && (
          <View style={styles.card}>
            {filtered.map((f, idx) => (
              <View
                key={f.id}
                style={[
                  styles.row,
                  idx === filtered.length - 1 && { borderBottomWidth: 0 },
                ]}>
                <View
                  style={[styles.avatar, { backgroundColor: f.avatarColor }]}>
                  <Text style={styles.avatarText}>{initials(f.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{f.name}</Text>
                  <Text style={styles.meta}>wants to connect</Text>
                </View>
                <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85} onPress={() => accept(f)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ignoreBtn} activeOpacity={0.85} onPress={() => ignore(f)}>
                  <Text style={styles.ignoreText}>Ignore</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'suggested' && (
          <View style={styles.card}>
            {filtered.map((f, idx) => (
              <View
                key={f.id}
                style={[
                  styles.row,
                  idx === filtered.length - 1 && { borderBottomWidth: 0 },
                ]}>
                <View
                  style={[styles.avatar, { backgroundColor: f.avatarColor }]}>
                  <Text style={styles.avatarText}>{initials(f.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{f.name}</Text>
                  <Text style={styles.meta}>
                    {f.mutuals} mutual · suggested
                  </Text>
                </View>
                <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => Alert.alert('Friends', 'Friends feature coming soon!')}>
                  <Ionicons name="person-add" size={14} color="#000" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'all' && friends.length === 0 && (
          <View style={styles.comingSoon}>
            <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={styles.comingSoonTitle}>No friends yet</Text>
            <Text style={styles.comingSoonSub}>
              Invite friends from your contacts to find deals together.
            </Text>
            <TouchableOpacity
              style={styles.inviteBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/contacts')}>
              <Text style={styles.inviteBtnText}>Invite Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'requests' && requests.length === 0 && (
          <View style={styles.emptyTab}>
            <Text style={styles.empty}>No pending requests</Text>
          </View>
        )}

        {tab === 'suggested' && suggested.length === 0 && (
          <View style={styles.emptyTab}>
            <Text style={styles.empty}>No suggestions yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  addLink: { color: '#C4F27F', fontSize: 13, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    backgroundColor: '#141414',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: 42,
    fontSize: 13,
    color: '#fff',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 8,
  },
  tab: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: { backgroundColor: '#C4F27F', borderColor: '#C4F27F' },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: { color: '#000', fontWeight: '700' },
  contentScroll: { flex: 1 },
  scroll: { paddingHorizontal: 14, paddingBottom: 40 },
  sectionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  viewAllText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C4F27F',
    borderWidth: 2,
    borderColor: '#141414',
  },
  name: { color: '#fff', fontSize: 13, fontWeight: '700' },
  meta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  points: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '800',
  },
  acceptBtn: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { color: '#000', fontSize: 11, fontWeight: '800' },
  ignoreBtn: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ignoreText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyTab: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  comingSoonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  comingSoonSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  inviteBtn: {
    marginTop: 20,
    backgroundColor: '#C4F27F',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  inviteBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
