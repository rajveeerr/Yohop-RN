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

type Tab = 'phone' | 'on-app' | 'invited';

type Contact = {
  id: string;
  name: string;
  phone: string;
  onApp: boolean;
  invited?: boolean;
  avatarColor: string;
};

const CONTACTS: Contact[] = [];

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ContactsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('phone');
  const [query, setQuery] = useState('');
  const [invited, setInvited] = useState<Record<string, boolean>>(
    CONTACTS.reduce((acc, c) => ({ ...acc, [c.id]: !!c.invited }), {}),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONTACTS.filter((c) => {
      if (tab === 'on-app' && !c.onApp) return false;
      if (tab === 'invited' && !invited[c.id]) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, query, invited]);

  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.reduce<Record<string, Contact[]>>((acc, c) => {
      const letter = c.name[0]?.toUpperCase() ?? '#';
      (acc[letter] ??= []).push(c);
      return acc;
    }, {});
  }, [filtered]);

  const onAppCount = CONTACTS.filter((c) => c.onApp).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Contacts</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert('Sync Contacts', 'Contact sync requires permission to read your contacts. This feature is coming soon.', [{ text: 'OK' }])}>
          <Text style={styles.syncLink}>Sync</Text>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'phone' && styles.tabActive]}
          onPress={() => setTab('phone')}
          activeOpacity={0.85}>
          <Text style={[styles.tabText, tab === 'phone' && styles.tabTextActive]}>
            Phone ({CONTACTS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'on-app' && styles.tabActive]}
          onPress={() => setTab('on-app')}
          activeOpacity={0.85}>
          <Text style={[styles.tabText, tab === 'on-app' && styles.tabTextActive]}>
            On App ({onAppCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'invited' && styles.tabActive]}
          onPress={() => setTab('invited')}
          activeOpacity={0.85}>
          <Text style={[styles.tabText, tab === 'invited' && styles.tabTextActive]}>
            Invited
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="people" size={18} color="#C4F27F" />
          </View>
          <Text style={styles.bannerText}>
            {onAppCount} contacts already on the app
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.bannerLink}>Add</Text>
          </TouchableOpacity>
        </View>

        {Object.entries(grouped).map(([letter, items]) => (
          <View key={letter}>
            <Text style={styles.letter}>{letter}</Text>
            {items.map((c) => (
              <View key={c.id} style={styles.row}>
                <View
                  style={[styles.avatar, { backgroundColor: c.avatarColor }]}>
                  <Text style={styles.avatarText}>{initials(c.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowNameRow}>
                    <Text style={styles.name}>{c.name}</Text>
                    {c.onApp && (
                      <View style={styles.onAppPill}>
                        <Text style={styles.onAppText}>ON APP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.phone}>{c.phone}</Text>
                </View>
                {c.onApp ? (
                  <View style={styles.addedIcon}>
                    <Ionicons name="checkmark" size={14} color="#C4F27F" />
                  </View>
                ) : invited[c.id] ? (
                  <View style={styles.invitedIcon}>
                    <Ionicons name="time-outline" size={14} color="#FFB300" />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.inviteBtn}
                    activeOpacity={0.85}
                    onPress={() =>
                      setInvited((p) => ({ ...p, [c.id]: true }))
                    }>
                    <Ionicons name="person-add-outline" size={14} color="#C4F27F" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}

        {CONTACTS.length === 0 && (
          <View style={styles.comingSoon}>
            <Ionicons name="call-outline" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={styles.comingSoonTitle}>Contacts sync coming soon</Text>
            <Text style={styles.comingSoonSub}>
              Connect your phone contacts to find friends already using the app.
            </Text>
          </View>
        )}

        {CONTACTS.length > 0 && filtered.length === 0 && (
          <Text style={styles.empty}>No contacts in this view.</Text>
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
  syncLink: { color: '#C4F27F', fontSize: 13, fontWeight: '700' },
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
  tabsRow: { paddingHorizontal: 14, gap: 8, paddingBottom: 8 },
  tab: {
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
  scroll: { paddingHorizontal: 14, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(196,242,127,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.3)',
    marginBottom: 14,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  bannerLink: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '700',
  },
  letter: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
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
  rowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: { color: '#fff', fontSize: 13, fontWeight: '700' },
  onAppPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(196,242,127,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  onAppText: {
    color: '#C4F27F',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  phone: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  inviteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(196,242,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,179,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 40,
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
});
