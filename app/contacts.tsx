import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReferrals } from '@/hooks/use-auth';

type Tab = 'phone' | 'on-app' | 'invited';

type Contact = {
  id: string;
  name: string;
  phone: string;
  onApp: boolean;
  avatarColor: string;
};

const AVATAR_COLORS = ['#C4F27F', '#7FB2F2', '#F2A65A', '#E57FB2', '#9B8CFF', '#5AD1C2'];

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ContactsScreen() {
  const router = useRouter();
  const { data: referral } = useReferrals();
  const [tab, setTab] = useState<Tab>('phone');
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [permission, setPermission] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [loading, setLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      const mapped: Contact[] = data
        .filter((c) => c.name && c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c, i) => ({
          id: c.id ?? String(i),
          name: c.name!,
          phone: c.phoneNumbers![0].number ?? '',
          onApp: false, // No backend contact-matching endpoint yet.
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        }));
      setContacts(mapped);
    } catch {
      // Leave the list empty; the empty state explains how to connect.
    } finally {
      setLoading(false);
    }
  }, []);

  // Try to load contacts automatically when the screen opens.
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const invite = useCallback(
    async (c: Contact) => {
      const code = referral?.referralCode;
      const message = code
        ? `Hey ${c.name.split(' ')[0]}! Join me on Yohop to find deals nearby. Use my invite code ${code} when you sign up.`
        : `Hey ${c.name.split(' ')[0]}! Join me on Yohop to find deals nearby.`;
      try {
        await Share.share({ message });
        setInvited((p) => ({ ...p, [c.id]: true }));
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    },
    [referral],
  );

  const onSync = () => {
    if (permission === 'denied') {
      Alert.alert(
        'Contacts access off',
        'Enable contacts permission in Settings to find friends from your phonebook.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    loadContacts();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (tab === 'on-app' && !c.onApp) return false;
      if (tab === 'invited' && !invited[c.id]) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, query, invited, contacts]);

  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return sorted.reduce<Record<string, Contact[]>>((acc, c) => {
      const letter = c.name[0]?.toUpperCase() ?? '#';
      (acc[letter] ??= []).push(c);
      return acc;
    }, {});
  }, [filtered]);

  const onAppCount = contacts.filter((c) => c.onApp).length;
  const invitedCount = contacts.filter((c) => invited[c.id]).length;

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
        <TouchableOpacity activeOpacity={0.7} onPress={onSync}>
          {loading ? (
            <ActivityIndicator size="small" color="#C4F27F" />
          ) : (
            <Text style={styles.syncLink}>Sync</Text>
          )}
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
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'phone' && styles.tabActive]}
          onPress={() => setTab('phone')}
          activeOpacity={0.85}>
          <Text style={[styles.tabText, tab === 'phone' && styles.tabTextActive]}>
            Phone ({contacts.length})
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
            Invited ({invitedCount})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {contacts.length > 0 && (
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="people" size={18} color="#C4F27F" />
            </View>
            <Text style={styles.bannerText}>
              {contacts.length} contacts found · invite them to Yohop
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const code = referral?.referralCode;
                Share.share({
                  message: code
                    ? `Join me on Yohop to find deals nearby! Use my invite code ${code} when you sign up.`
                    : 'Join me on Yohop to find deals nearby!',
                });
              }}>
              <Text style={styles.bannerLink}>Invite</Text>
            </TouchableOpacity>
          </View>
        )}

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
                    onPress={() => invite(c)}>
                    <Ionicons name="person-add-outline" size={14} color="#C4F27F" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}

        {contacts.length === 0 && !loading && (
          <View style={styles.comingSoon}>
            <Ionicons name="call-outline" size={40} color="rgba(255,255,255,0.2)" />
            <Text style={styles.comingSoonTitle}>
              {permission === 'denied' ? 'Contacts access needed' : 'No contacts found'}
            </Text>
            <Text style={styles.comingSoonSub}>
              {permission === 'denied'
                ? 'Allow contacts access to find friends and invite them to Yohop.'
                : 'Connect your phone contacts to find and invite friends.'}
            </Text>
            <TouchableOpacity style={styles.connectBtn} activeOpacity={0.85} onPress={onSync}>
              <Text style={styles.connectBtnText}>
                {permission === 'denied' ? 'Open settings' : 'Connect contacts'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && contacts.length === 0 && (
          <View style={styles.comingSoon}>
            <ActivityIndicator color="#C4F27F" />
          </View>
        )}

        {contacts.length > 0 && filtered.length === 0 && (
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
  tabsScroll: { flexGrow: 0 },
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
  connectBtn: {
    marginTop: 18,
    backgroundColor: '#C4F27F',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  connectBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
