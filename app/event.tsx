import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvent } from '@/hooks/use-events';

type Tab = 'tickets' | 'overview' | 'lineup' | 'merch';

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&q=80';

function formatPrice(n: number): string {
  return `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }) + ', ' + d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function shortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function EventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [tab, setTab] = useState<Tab>('tickets');
  const [tickets, setTickets] = useState(2);
  const { data: event, isLoading } = useEvent(id);

  const hero = event?.coverImage ?? event?.images?.[0] ?? HERO_FALLBACK;
  const title = event?.title ?? (isLoading ? 'Loading…' : 'Event');
  const dateMeta = event?.startDate ? formatEventDate(event.startDate) : '';
  const locationMeta = [event?.venue, event?.city]
    .filter((x): x is string => !!x)
    .join(' · ');
  const ticketTiers = event?.ticketTiers ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.hero}>
        <Image source={{ uri: hero }} style={styles.heroImg} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroTopRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Ionicons name="search-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroBottom}>
          <Text style={styles.eventTitle}>{title}</Text>
          {dateMeta ? <Text style={styles.eventMeta}>{dateMeta}</Text> : null}
          {locationMeta ? (
            <View style={styles.metaDotRow}>
              <View style={styles.greenDot} />
              <Text style={styles.eventDistance}>{locationMeta}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.pickersRow}>
        <View style={styles.pickerCard}>
          <Text style={styles.pickerLabel}>Choose Date</Text>
          <View style={styles.pickerValueRow}>
            <Ionicons name="calendar-outline" size={12} color="#C4F27F" />
            <Text style={styles.pickerValue}>
              {event?.startDate ? shortDate(event.startDate) : '—'}
            </Text>
          </View>
        </View>
        <View style={styles.pickerCard}>
          <Text style={styles.pickerLabel}>Choose in Time</Text>
          <View style={styles.pickerValueRow}>
            <Ionicons name="time-outline" size={12} color="#C4F27F" />
            <Text style={styles.pickerValue}>
              {event?.startDate ? shortTime(event.startDate) : '—'}
            </Text>
          </View>
        </View>
        <View style={styles.pickerCard}>
          <Text style={styles.pickerLabel}>Tickets</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              hitSlop={6}
              onPress={() => setTickets((t) => Math.max(1, t - 1))}>
              <Ionicons name="remove" size={14} color="#C4F27F" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>
              {tickets.toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity
              hitSlop={6}
              onPress={() => setTickets((t) => Math.min(10, t + 1))}>
              <Ionicons name="add" size={14} color="#C4F27F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['tickets', 'overview', 'lineup', 'merch'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.tabBtn}
            onPress={() => setTab(t)}
            activeOpacity={0.85}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'tickets'
                ? 'Tickets'
                : t === 'overview'
                ? 'Overview'
                : t === 'lineup'
                ? 'Lineup'
                : 'Merch'}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {tab === 'tickets' && (
          <View style={{ gap: 10 }}>
            {ticketTiers.length === 0 ? (
              <Text style={styles.emptyTabText}>
                {isLoading ? 'Loading tickets…' : 'No tickets available'}
              </Text>
            ) : (
              ticketTiers.map((tk) => {
                const remaining = tk.quantity - tk.sold;
                const soldOut = remaining <= 0;
                return (
                  <View key={tk.id} style={styles.ticketRow}>
                    <View style={styles.ticketIcon}>
                      <Ionicons name="ticket-outline" size={18} color="#C4F27F" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.ticketHeader}>
                        <Text style={styles.ticketName}>{tk.name}</Text>
                        <Ionicons
                          name="information-circle-outline"
                          size={12}
                          color="rgba(255,255,255,0.4)"
                        />
                      </View>
                      <Text style={styles.ticketPrice}>{formatPrice(tk.price)}</Text>
                      {tk.description ? (
                        <Text style={styles.ticketPerk}>· {tk.description}</Text>
                      ) : null}
                      <Text style={styles.ticketPerk}>
                        · {soldOut ? 'Sold out' : `${remaining} left`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addBtn, soldOut && { opacity: 0.4 }]}
                      activeOpacity={0.85}
                      disabled={soldOut}>
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {tab === 'overview' && (
          <View style={{ gap: 18 }}>
            {event?.merchant ? (
              <View>
                <Text style={styles.smallHeading}>Organized By</Text>
                <View style={styles.orgRow}>
                  <View style={styles.orgAvatar} />
                  <Text style={styles.orgName}>
                    {event.merchant.businessName}
                  </Text>
                  <TouchableOpacity style={styles.followBtn} activeOpacity={0.85}>
                    <Text style={styles.followText}>Follow</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {event?.description ? (
              <View>
                <Text style={styles.smallHeading}>About the event</Text>
                <Text style={styles.aboutText}>{event.description}</Text>
              </View>
            ) : null}

            <View>
              <Text style={styles.smallHeading}>Event Details</Text>
              <View style={styles.detailGrid}>
                {event?.startDate ? (
                  <DetailItem
                    icon="time-outline"
                    label={`Starts ${shortTime(event.startDate)}`}
                  />
                ) : null}
                {event?.capacity ? (
                  <DetailItem
                    icon="people-outline"
                    label={`${event.capacity.toLocaleString()} capacity`}
                  />
                ) : null}
                {event?.type ? (
                  <DetailItem
                    icon="pricetag-outline"
                    label={event.type.replace(/_/g, ' ').toLowerCase()}
                  />
                ) : null}
              </View>
            </View>

            {event?.venue || event?.address ? (
              <View>
                <Text style={styles.smallHeading}>Venue</Text>
                <View style={styles.venueCard}>
                  <View style={styles.venueImage}>
                    <Ionicons
                      name="business-outline"
                      size={22}
                      color="rgba(255,255,255,0.4)"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.venueName}>
                      {event?.venue ?? 'Venue'}
                    </Text>
                    <Text style={styles.venueAddr}>
                      {[event?.address, event?.city]
                        .filter((x): x is string => !!x)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.4)"
                  />
                </View>
              </View>
            ) : null}
          </View>
        )}

        {tab === 'lineup' && (
          <View style={styles.emptyTabWrap}>
            <Ionicons name="musical-notes-outline" size={36} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTabText}>Lineup coming soon.</Text>
          </View>
        )}

        {tab === 'merch' && (
          <View style={styles.emptyTabWrap}>
            <Ionicons name="shirt-outline" size={36} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTabText}>Merch drops soon.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/book',
              params: { type: 'event', eventId: id ?? '', title },
            })
          }>
          <Text style={styles.bookText}>Book a ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkinBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/checkin',
              params: { eventId: id ?? '', title, tickets: String(tickets) },
            })
          }>
          <Ionicons name="finger-print" size={14} color="#000" />
          <Text style={styles.checkinText}>Check-in Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DetailItem({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={13} color="#C4F27F" />
      <Text style={styles.detailText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  hero: {
    height: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  eventMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  metaDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C4F27F',
  },
  eventDistance: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  pickersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  pickerCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pickerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pickerValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  qtyValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '25%',
    right: '25%',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#C4F27F',
  },
  scroll: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 120,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ticketIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.35)',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  ticketPrice: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  ticketPerk: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C4F27F',
    backgroundColor: 'transparent',
  },
  addText: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '800',
  },
  smallHeading: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orgName: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C4F27F',
  },
  followText: {
    color: '#C4F27F',
    fontSize: 11,
    fontWeight: '800',
  },
  aboutText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 18,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  venueImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  venueAddr: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  dateChipRow: {
    flexDirection: 'row',
  },
  dateChip: {
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderColor: '#C4F27F',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateChipDay: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '800',
  },
  dateChipSub: {
    color: 'rgba(196,242,127,0.8)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  timelineCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  performerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performerInitials: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  performerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  performerRole: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 2,
  },
  emptyTabWrap: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  bookBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  checkinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C4F27F',
  },
  checkinText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
});
