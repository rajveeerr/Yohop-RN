import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegisterForEvent } from '@/hooks/use-event-register';
import { useBookTable, useTableAvailability } from '@/hooks/use-table-booking';

const DATE_OPTIONS = ['10 Apr', '11 Apr', '12 Apr', '13 Apr', '14 Apr', '15 Apr'];
const TIME_OPTIONS = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];

const VENUE_HERO = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80';
const EVENT_HERO = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80';

const VENUE_TABS = ['Preference', 'HappyHours', 'Lineup'];
const EVENT_TABS = ['Tickets', 'Overview', 'Lineup'];

type Seat = { id: string; title: string; price: number };
const VENUE_SEATS: Seat[] = [
  { id: '1', title: 'Sea facing table', price: 40.07 },
  { id: '2', title: 'Rooftop', price: 40.07 },
  { id: '3', title: 'Private cubicle', price: 40.07 },
];
const EVENT_SEATS: Seat[] = [
  { id: '1', title: 'Silver - Weekend Offer', price: 40.07 },
  { id: '2', title: 'Gold - Weekend Offer', price: 40.07 },
  { id: '3', title: 'Platinum - Weekend Offer', price: 40.07 },
];

export default function BookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type?: string;
    title?: string;
    image?: string;
    merchantId?: string;
    eventId?: string;
  }>();
  const isEvent = params.type === 'event';
  const HERO = isEvent ? params.image || EVENT_HERO : VENUE_HERO;
  const TABS = isEvent ? EVENT_TABS : VENUE_TABS;
  const SEATS = isEvent ? EVENT_SEATS : VENUE_SEATS;
  const title = params.title || (isEvent ? 'Event' : 'Booking');
  const [tab, setTab] = useState(TABS[0]);
  const [tableCount, setTableCount] = useState(2);
  const [addedSeats, setAddedSeats] = useState<Record<string, boolean>>({});
  const [date, setDate] = useState('12 Apr');
  const [time, setTime] = useState('6:00 PM');
  const [pickerOpen, setPickerOpen] = useState(false);
  const bookTable = useBookTable();
  const registerEvent = useRegisterForEvent(params.eventId);
  const busy = bookTable.isPending || registerEvent.isPending;

  const isoDate = parseRelativeDate(date);
  const { data: availabilitySlots, isLoading: slotsLoading } = useTableAvailability({
    merchantId: !isEvent ? params.merchantId : undefined,
    date: isoDate,
    partySize: tableCount,
  });
  const timeOptions = availabilitySlots && availabilitySlots.length > 0
    ? availabilitySlots.map((s) => s.time)
    : TIME_OPTIONS;

  const toggleSeat = (id: string) =>
    setAddedSeats((s) => ({ ...s, [id]: !s[id] }));

  const subtotal = SEATS.reduce(
    (sum, s) => (addedSeats[s.id] ? sum + s.price : sum),
    0,
  );
  const hasItems = subtotal > 0;

  const onConfirmBooking = async () => {
    try {
      if (isEvent && params.eventId) {
        const result = await registerEvent.mutateAsync({
          quantity: tableCount,
        });
        router.replace({
          pathname: '/booked',
          params: {
            title,
            type: 'event',
            confirmationCode: result.confirmationCode ?? '',
          },
        });
        return;
      }
      if (!isEvent && params.merchantId) {
        const result = await bookTable.mutateAsync({
          merchantId: params.merchantId,
          date: isoDate,
          time,
          partySize: tableCount,
        });
        router.replace({
          pathname: '/booked',
          params: {
            title,
            type: 'table',
            confirmationCode: result.confirmationCode,
          },
        });
        return;
      }
      router.push({
        pathname: '/details',
        params: {
          merchantId: params.merchantId ?? '',
          date: isoDate,
          time,
          partySize: String(tableCount),
          title,
          subtotal: subtotal > 0 ? String(subtotal.toFixed(2)) : '',
        },
      });
    } catch (e: any) {
      Alert.alert('Booking failed', e?.message ?? 'Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={{ uri: HERO }} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundBtn}>
              <Ionicons name="search" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.openStatus}>
                {isEvent ? 'Sun, 12 Apr, 6:00 PM' : 'Open till 10PM'}
              </Text>
              <TouchableOpacity style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#fff" />
                <Text style={styles.locationText}>20 miles away • East Wing, Atlanta</Text>
                <Ionicons name="chevron-down" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.pillsRow}>
              <TouchableOpacity
                style={styles.pill}
                activeOpacity={0.8}
                onPress={() => setPickerOpen(true)}>
                <Text style={styles.pillLabel}>Choose Date</Text>
                <Text style={styles.pillValue}>{date}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pill}
                activeOpacity={0.8}
                onPress={() => setPickerOpen(true)}>
                <Text style={styles.pillLabel}>Check-in Time</Text>
                <Text style={styles.pillValue}>{time}</Text>
              </TouchableOpacity>
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>{isEvent ? 'Tickets' : 'Table for'}</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    onPress={() => setTableCount((c) => Math.max(1, c - 1))}
                    hitSlop={8}>
                    <Text style={styles.counterOp}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>
                    {String(tableCount).padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTableCount((c) => c + 1)}
                    hitSlop={8}>
                    <Text style={styles.counterOp}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.tabsRow}>
              {TABS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.tabItem}
                  onPress={() => setTab(p)}
                  activeOpacity={0.8}>
                  <Text style={[styles.tabText, tab === p && styles.tabTextActive]}>
                    {p}
                  </Text>
                  {tab === p && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.seatList}>
              {SEATS.map((s) => (
                <View key={s.id} style={styles.seatItem}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.seatTitleRow}>
                      <Text style={styles.seatTitle}>{s.title}</Text>
                      <TouchableOpacity
                        style={styles.seatInfoBtn}
                        activeOpacity={0.7}
                        hitSlop={8}
                        onPress={() => setPickerOpen(true)}>
                        <Ionicons
                          name="information-circle-outline"
                          size={16}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.seatPrice}>$price</Text>
                    <Text style={styles.seatBullet}>- All seats are standing</Text>
                    <Text style={styles.seatBullet}>- Located in the rear section</Text>
                    <Text style={styles.seatBullet}>
                      - Great view and full concert experience
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, addedSeats[s.id] && styles.addBtnActive]}
                    activeOpacity={0.8}
                    onPress={() => toggleSeat(s.id)}>
                    <Text
                      style={[
                        styles.addBtnText,
                        addedSeats[s.id] && styles.addBtnTextActive,
                      ]}>
                      {addedSeats[s.id] ? 'Added' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.bottomWrap}>
            {hasItems && (
              <TouchableOpacity
                style={styles.subtotalPill}
                activeOpacity={0.9}
                onPress={() => router.push('/details')}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <View style={styles.subtotalRight}>
                  <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#000" />
                </View>
              </TouchableOpacity>
            )}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomBtn, busy && { opacity: 0.6 }]}
                activeOpacity={0.85}
                disabled={busy}
                onPress={onConfirmBooking}>
                {isEvent ? (
                  <Ionicons name="ticket-outline" size={16} color="#fff" />
                ) : (
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={16}
                    color="#fff"
                  />
                )}
                <Text style={styles.bottomBtnText}>
                  {busy
                    ? 'Booking…'
                    : isEvent
                    ? 'Book a ticket'
                    : 'Book a table'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomBtn}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: '/checkin',
                    params: {
                      eventId: params.eventId ?? '',
                      merchantId: params.merchantId ?? '',
                      title,
                      tickets: String(tableCount),
                    },
                  })
                }>
                <Ionicons name="finger-print" size={16} color="#fff" />
                <Text style={styles.bottomBtnText}>Check-in Now</Text>
              </TouchableOpacity>
            </View>
          </View>

        </SafeAreaView>

        <Modal
          transparent
          visible={pickerOpen}
          animationType="fade"
          onRequestClose={() => setPickerOpen(false)}>
          <Pressable
            style={styles.pickerBackdrop}
            onPress={() => setPickerOpen(false)}>
            <Pressable
              style={styles.pickerSheet}
              onPress={(e) => e.stopPropagation()}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Booking details</Text>
                <TouchableOpacity
                  onPress={() => setPickerOpen(false)}
                  hitSlop={10}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.pickerLabel}>Choose Date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}>
                {DATE_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, date === d && styles.chipActive]}
                    activeOpacity={0.8}
                    onPress={() => setDate(d)}>
                    <Text
                      style={[
                        styles.chipText,
                        date === d && styles.chipTextActive,
                      ]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.pickerLabel}>Check-in Time</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}>
                {slotsLoading ? (
                  <ActivityIndicator color="#C4F27F" size="small" />
                ) : timeOptions.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, time === t && styles.chipActive]}
                    activeOpacity={0.8}
                    onPress={() => setTime(t)}>
                    <Text
                      style={[
                        styles.chipText,
                        time === t && styles.chipTextActive,
                      ]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.pickerLabel}>
                {isEvent ? 'Tickets' : 'Number of Tables'}
              </Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTableCount((c) => Math.max(1, c - 1))}
                  hitSlop={8}>
                  <Ionicons name="remove" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>
                  {String(tableCount).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTableCount((c) => c + 1)}
                  hitSlop={8}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.pickerConfirm}
                activeOpacity={0.9}
                onPress={() => setPickerOpen(false)}>
                <Text style={styles.pickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </ImageBackground>
    </View>
  );
}

function parseRelativeDate(label: string): string {
  const match = label.match(/^(\d{1,2})\s+([A-Za-z]+)$/);
  if (!match) return new Date().toISOString().split('T')[0];
  const day = Number(match[1]);
  const monthName = match[2].slice(0, 3).toLowerCase();
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const month = months[monthName];
  if (month === undefined) return new Date().toISOString().split('T')[0];
  const year = new Date().getFullYear();
  const d = new Date(Date.UTC(year, month, day));
  return d.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  roundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  titleBlock: {
    paddingHorizontal: 18,
    marginTop: 100,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  openStatus: {
    color: '#C4F27F',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: { color: '#fff', fontSize: 12 },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 3,
  },
  pillValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterOp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  counterValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 22,
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginBottom: 14,
    gap: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 14,
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  tabText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabUnderline: {
    marginTop: 4,
    height: 2,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  seatList: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  seatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  seatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  seatInfoBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatPrice: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  seatBullet: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    lineHeight: 16,
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  addBtnActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addBtnTextActive: { color: '#000' },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
  },
  subtotalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C4F27F',
    marginHorizontal: 14,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginBottom: 10,
  },
  subtotalLabel: { color: '#000', fontSize: 14, fontWeight: '600' },
  subtotalRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subtotalValue: { color: '#000', fontSize: 16, fontWeight: '700' },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1f3a2a',
    borderRadius: 24,
    paddingVertical: 12,
  },
  bottomBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  pickerConfirm: {
    marginTop: 20,
    backgroundColor: '#C4F27F',
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickerConfirmText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
