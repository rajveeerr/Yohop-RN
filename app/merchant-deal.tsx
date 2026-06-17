import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SectionHeader } from '@/components/section-header';
import { useMe } from '@/hooks/use-auth';
import { useDeal } from '@/hooks/use-deals';
import {
  useCreateMerchantDeal,
  useUpdateMerchantDeal,
} from '@/hooks/use-merchant-crud';
import type { Deal } from '@/services/types';

type DealType = 'discount' | 'free-item' | 'buy-x-get-y' | 'bounty';
type DealTime = 'morning' | 'midday' | 'evening';
type Duration = '30min' | '1hr' | '2hr' | '3hr';
type CheckinReward = 'free-drink' | '50pts' | 'free-starter' | 'none';
type RewardKind = 'checkins' | 'bounties' | 'streaks';
type Eligibility = 'all' | 'new' | 'returning' | 'pro';

const SAMPLE_HERO =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80';

const ELIGIBILITY_OPTIONS: {
  key: Eligibility;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'all', label: 'All customers', icon: 'people-outline' },
  { key: 'new', label: 'New only', icon: 'person-add-outline' },
  { key: 'returning', label: 'Returning', icon: 'refresh-outline' },
  { key: 'pro', label: 'Pro members', icon: 'diamond-outline' },
];

const DEAL_TYPES: {
  key: DealType;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'discount', label: '% Discount', sub: 'Off total bill', icon: 'pricetag-outline' },
  { key: 'free-item', label: 'Free item', sub: 'Drink or food', icon: 'gift-outline' },
  { key: 'buy-x-get-y', label: 'Buy X get Y', sub: 'Bundle offer', icon: 'cube-outline' },
  { key: 'bounty', label: 'Bounty points', sub: 'Reward check-ins', icon: 'sparkles-outline' },
];

const DURATIONS: { key: Duration; label: string }[] = [
  { key: '30min', label: '30 min' },
  { key: '1hr', label: '1 hr' },
  { key: '2hr', label: '2 hrs' },
  { key: '3hr', label: '3 hrs' },
];

const TIMES: { key: DealTime; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'midday', label: 'Mid Day' },
  { key: 'evening', label: 'Evening' },
];

const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const CATEGORIES = ['Tacos', 'Burgers', 'Drinks', 'Appetizers', 'Desserts'];

const REWARDS: { key: RewardKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'checkins', label: 'Check-ins', icon: 'location-outline' },
  { key: 'bounties', label: 'Bounties', icon: 'sparkles-outline' },
  { key: 'streaks', label: 'Streaks', icon: 'flame-outline' },
];

const CHECKIN_REWARDS: {
  key: CheckinReward;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'free-drink', label: 'Free drink', icon: 'wine-outline' },
  { key: '50pts', label: '50 pts', icon: 'sparkles-outline' },
  { key: 'free-starter', label: 'Free starter', icon: 'fast-food-outline' },
  { key: 'none', label: 'No reward', icon: 'close-circle-outline' },
];

const TIPS: Record<DealType, string> = {
  discount: 'Deals with a free drink reward get 2.4x more check-ins on average.',
  'free-item': 'Free item deals drive 3.14x more check-ins than discount only offers.',
  'buy-x-get-y':
    'Bundle deals increase avg order size by 22% vs single item promos.',
  bounty: 'Bounty deals build repeat visits — customers with milestones return 2.8x more often.',
};

export default function MerchantDealEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: me } = useMe();
  const merchantId = me?.merchantId ?? undefined;
  const { data: existing } = useDeal(id);
  const createDeal = useCreateMerchantDeal(merchantId);
  const updateDeal = useUpdateMerchantDeal(merchantId);
  const saving = createDeal.isPending || updateDeal.isPending;

  const [dealName, setDealName] = useState(existing?.title ?? 'Happy Hour - Free Dessert');
  const [type, setType] = useState<DealType>(
    existing?.isBounty ? 'bounty' : 'discount',
  );

  // % discount
  const [discountPct, setDiscountPct] = useState(
    existing?.discountPercentage ? String(existing.discountPercentage) : '60',
  );
  const [upTo, setUpTo] = useState('5.00');
  const [maxDiscount, setMaxDiscount] = useState('35.00');

  // free item
  const [freeItem, setFreeItem] = useState('Dessert of Choice');
  const [maxValue, setMaxValue] = useState('8.00');
  const [minSpend, setMinSpend] = useState('20.00');

  // buy x get y
  const [buyX, setBuyX] = useState('2');
  const [getY, setGetY] = useState('1');
  const [yOff, setYOff] = useState('100');
  const [discountedItem, setDiscountedItem] = useState('Cheapest item in the order');
  const [appliesTo, setAppliesTo] = useState<string>('Burgers');

  // bounty
  const [pointsX, setPointsX] = useState('2');

  // shared
  const [description, setDescription] = useState('');
  const [heroUri, setHeroUri] = useState<string | null>(
    existing?.images?.[0] ?? null,
  );
  const [dealTime, setDealTime] = useState<DealTime>('midday');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [picker, setPicker] = useState<{
    field: 'startDate' | 'endDate' | 'startTime' | 'endTime';
    mode: 'date' | 'time';
  } | null>(null);
  const [duration, setDuration] = useState<Duration>('1hr');
  const [maxRedemptions, setMaxRedemptions] = useState('50');
  const [recurringDays, setRecurringDays] = useState<Set<string>>(new Set(['MO']));
  const [recurring, setRecurring] = useState(true);
  const [rewards, setRewards] = useState<Set<RewardKind>>(new Set());
  const [checkinReward, setCheckinReward] = useState<CheckinReward>('free-drink');
  const [eligibility, setEligibility] = useState<Eligibility>('all');
  const [stackable, setStackable] = useState(false);
  const [terms, setTerms] = useState('');
  const [notification, setNotification] = useState('');
  const [appliesTags, setAppliesTags] = useState<Set<string>>(new Set());

  const isDiscount = type === 'discount';
  const isFreeItem = type === 'free-item';
  const isBuyXGetY = type === 'buy-x-get-y';
  const isBounty = type === 'bounty';

  const canPublish = dealName.trim().length > 0 && !!merchantId;

  const buildPayload = () => {
    const now = new Date();
    // Combine the chosen date + time; backend requires a future start and a
    // valid range, so coerce sensible defaults if the merchant left them blank.
    let start = combineDateTime(startDate, startTime) ?? new Date(now.getTime() + 5 * 60_000);
    if (start.getTime() < now.getTime()) start = new Date(now.getTime() + 5 * 60_000);
    let end = combineDateTime(endDate, endTime) ?? new Date(start.getTime() + 30 * 86_400_000);
    if (end.getTime() <= start.getTime()) end = new Date(start.getTime() + 30 * 86_400_000);

    const payload: any = {
      title: dealName.trim(),
      description: description || null,
      activeDateRange: { startDate: start.toISOString(), endDate: end.toISOString() },
      imageUrls: heroUri && /^https?:\/\//.test(heroUri) ? [heroUri] : [],
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
    };
    // The backend needs at least one offer field.
    if (isDiscount && discountPct) {
      payload.discountPercentage = Number(discountPct);
    } else {
      payload.customOfferDisplay = previewLine || dealName;
    }
    return payload;
  };

  const onSave = async (publish: boolean) => {
    if (!merchantId) {
      Alert.alert('Not a merchant', 'Complete merchant onboarding first.');
      return;
    }
    try {
      const payload = buildPayload();
      if (id) {
        await updateDeal.mutateAsync({ dealId: id, ...(payload as any) });
      } else {
        await createDeal.mutateAsync(payload);
      }
      if (publish) {
        router.replace({
          pathname: '/deal-published',
          params: { name: dealName },
        });
      } else {
        router.back();
      }
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Please try again.');
    }
  };

  const toggleDay = (d: string) => {
    setRecurringDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  const toggleReward = (r: RewardKind) => {
    setRewards((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  const toggleAppliesTag = (t: string) => {
    setAppliesTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const previewTitle = isDiscount
    ? dealName
    : isFreeItem
    ? `${dealName}`
    : isBuyXGetY
    ? `Buy ${buyX} ${appliesTo.toLowerCase()}, Get ${getY} Free`
    : `${dealName}`;

  const previewLine = isDiscount
    ? `${discountPct}% off · up to $${maxDiscount}`
    : isFreeItem
    ? `Free ${freeItem.toLowerCase()} on $${minSpend} spend`
    : isBuyXGetY
    ? `${yOff}% off Y · Bundle deal`
    : `${pointsX}× points per check-in`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {existing ? 'Edit Deal' : 'New Deal'}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!!merchantId && me?.merchantStatus && me.merchantStatus !== 'APPROVED' && (
            <View style={styles.pendingBanner}>
              <Ionicons name="time-outline" size={16} color="#FFB300" />
              <Text style={styles.pendingBannerText}>
                Your merchant account is {me.merchantStatus.toLowerCase()}. You can
                set up deals, but publishing is enabled once your account is approved.
              </Text>
            </View>
          )}
          <Text style={styles.fieldLabel}>DEAL NAME</Text>
          <View style={styles.nameWrap}>
            <TextInput
              style={styles.nameInput}
              value={dealName}
              onChangeText={setDealName}
              placeholder="Give it a catchy name"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>

          <Text style={styles.fieldLabel}>HERO IMAGE</Text>
          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.85}
            onPress={() => setHeroUri(heroUri ? null : SAMPLE_HERO)}>
            {heroUri ? (
              <>
                <Image source={{ uri: heroUri }} style={styles.heroImg} />
                <View style={styles.heroOverlay} />
                <View style={styles.heroBadge}>
                  <Ionicons name="swap-horizontal" size={12} color="#000" />
                  <Text style={styles.heroBadgeText}>Replace</Text>
                </View>
              </>
            ) : (
              <View style={styles.heroPlaceholder}>
                <Ionicons name="image-outline" size={26} color="#fff" />
                <Text style={styles.heroPlaceholderText}>Add a hero image</Text>
                <Text style={styles.heroPlaceholderSub}>
                  Shown on the deal card in the feed
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <View style={[styles.input, styles.inputMultiWrap]}>
            <TextInput
              style={[styles.inputText, styles.inputMulti]}
              value={description}
              onChangeText={setDescription}
              placeholder="What customers should know — 1–2 short lines"
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              numberOfLines={3}
            />
          </View>

          <Text style={styles.fieldLabel}>DEAL TYPE</Text>
          <View style={styles.typeGrid}>
            {DEAL_TYPES.map((dt) => {
              const active = type === dt.key;
              return (
                <TouchableOpacity
                  key={dt.key}
                  activeOpacity={0.85}
                  style={[styles.typeCard, active && styles.typeCardActive]}
                  onPress={() => setType(dt.key)}>
                  <Ionicons
                    name={dt.icon}
                    size={18}
                    color={active ? '#C4F27F' : 'rgba(255,255,255,0.75)'}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      active && styles.typeLabelActive,
                    ]}>
                    {dt.label}
                  </Text>
                  <Text style={styles.typeSub}>{dt.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isDiscount && (
            <View style={styles.tripleRow}>
              <SmallField
                label="DISCOUNT"
                value={discountPct}
                onChangeText={setDiscountPct}
                suffix="%"
              />
              <SmallField
                label="UPTO"
                value={upTo}
                onChangeText={setUpTo}
                prefix="$"
              />
              <SmallField
                label="MAX DISCOUNT"
                value={maxDiscount}
                onChangeText={setMaxDiscount}
                prefix="$"
              />
            </View>
          )}

          {isFreeItem && (
            <>
              <Text style={styles.fieldLabel}>FREE ITEM</Text>
              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  value={freeItem}
                  onChangeText={setFreeItem}
                  placeholder="What's free?"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                />
              </View>

              <View style={styles.rowGroup}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>MAX VALUE</Text>
                  <View style={styles.input}>
                    <Text style={styles.prefix}>$</Text>
                    <TextInput
                      style={[styles.inputText, { paddingLeft: 4 }]}
                      value={maxValue}
                      onChangeText={setMaxValue}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>MIN SPEND</Text>
                  <View style={styles.input}>
                    <Text style={styles.prefix}>$</Text>
                    <TextInput
                      style={[styles.inputText, { paddingLeft: 4 }]}
                      value={minSpend}
                      onChangeText={setMinSpend}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {isBuyXGetY && (
            <>
              <View style={styles.tripleRow}>
                <SmallField
                  label="BUY(X)"
                  value={buyX}
                  onChangeText={setBuyX}
                />
                <SmallField
                  label="GET(Y)"
                  value={getY}
                  onChangeText={setGetY}
                />
                <SmallField
                  label="OFF"
                  value={yOff}
                  onChangeText={setYOff}
                  suffix="%"
                />
              </View>

              <Text style={styles.fieldLabel}>WHICH ITEM IS FREE/DISCOUNTED?</Text>
              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  value={discountedItem}
                  onChangeText={setDiscountedItem}
                  placeholder="Cheapest item in the order"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                />
              </View>

              <Text style={styles.fieldLabel}>APPLIES TO CATEGORIES</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillRow}>
                {CATEGORIES.map((c) => {
                  const active = appliesTo === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setAppliesTo(c)}
                      activeOpacity={0.85}>
                      <Text
                        style={[
                          styles.pillText,
                          active && styles.pillTextActive,
                        ]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {isBounty && (
            <>
              <Text style={styles.fieldLabel}>POINTS PER CHECK-IN</Text>
              <View style={styles.sliderRow}>
                <View style={styles.multBadge}>
                  <Text style={styles.multBadgeText}>{pointsX}X</Text>
                </View>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderFill,
                      { width: `${Math.min(100, Number(pointsX) * 20)}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${Math.min(96, Number(pointsX) * 20)}%` },
                    ]}
                  />
                </View>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>1× base</Text>
                  <Text style={styles.sliderLabel}>5× max</Text>
                </View>
              </View>
              <View style={styles.sliderQuickRow}>
                {['1', '2', '3', '5'].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.quickPill,
                      pointsX === v && styles.quickPillActive,
                    ]}
                    onPress={() => setPointsX(v)}
                    activeOpacity={0.85}>
                    <Text
                      style={[
                        styles.quickPillText,
                        pointsX === v && styles.quickPillTextActive,
                      ]}>
                      {v}X
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>WHICH ITEM IS FREE/DISCOUNTED?</Text>
              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  value={discountedItem}
                  onChangeText={setDiscountedItem}
                  placeholder="Cheapest item in the order"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                />
              </View>
            </>
          )}

          <Text style={styles.fieldLabel}>DEAL TIME</Text>
          <View style={styles.pillRow}>
            {TIMES.map((t) => {
              const active = dealTime === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setDealTime(t.key)}
                  activeOpacity={0.85}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.recurringHeader}>
            <Text style={styles.fieldLabel}>RECURRING</Text>
            <TouchableOpacity
              onPress={() => setRecurring((v) => !v)}
              hitSlop={10}>
              <View
                style={[
                  styles.checkbox,
                  recurring && styles.checkboxActive,
                ]}>
                {recurring ? (
                  <Ionicons name="checkmark" size={11} color="#000" />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
          {recurring && (
            <View style={styles.daysRow}>
              {DAYS.map((d) => {
                const active = recurringDays.has(d);
                return (
                  <TouchableOpacity
                    key={d}
                    activeOpacity={0.85}
                    style={[
                      styles.dayCircle,
                      active && styles.dayCircleActive,
                    ]}
                    onPress={() => toggleDay(d)}>
                    <Text
                      style={[
                        styles.dayText,
                        active && styles.dayTextActive,
                      ]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.rowGroup}>
            <PickerField
              label="START DATE"
              value={fmtDate(startDate)}
              placeholder="MM/DD/YYYY"
              onPress={() => setPicker({ field: 'startDate', mode: 'date' })}
            />
            <PickerField
              label="END DATE"
              value={fmtDate(endDate)}
              placeholder="MM/DD/YYYY"
              onPress={() => setPicker({ field: 'endDate', mode: 'date' })}
            />
          </View>

          <View style={styles.rowGroup}>
            <PickerField
              label="START TIME"
              value={fmtTime(startTime)}
              placeholder="00:00"
              onPress={() => setPicker({ field: 'startTime', mode: 'time' })}
            />
            <PickerField
              label="END TIME"
              value={fmtTime(endTime)}
              placeholder="00:00"
              onPress={() => setPicker({ field: 'endTime', mode: 'time' })}
            />
          </View>

          <Text style={styles.fieldLabel}>DURATION</Text>
          <View style={styles.pillRow}>
            {DURATIONS.map((d) => {
              const active = duration === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setDuration(d.key)}
                  activeOpacity={0.85}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>REWARDS</Text>
          <View style={styles.pillRow}>
            {REWARDS.map((r) => {
              const active = rewards.has(r.key);
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.rewardPill, active && styles.rewardPillActive]}
                  onPress={() => toggleReward(r.key)}
                  activeOpacity={0.85}>
                  <Ionicons
                    name={r.icon}
                    size={12}
                    color={active ? '#C4F27F' : 'rgba(255,255,255,0.65)'}
                  />
                  <Text
                    style={[
                      styles.rewardPillText,
                      active && styles.rewardPillTextActive,
                    ]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>MAX REDEMPTIONS (OPTIONAL)</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.inputText}
              value={maxRedemptions}
              onChangeText={setMaxRedemptions}
              placeholder="50 uses"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.fieldLabel}>CHECKIN REWARD (OPTIONAL)</Text>
          <View style={styles.checkinGrid}>
            {CHECKIN_REWARDS.map((r) => {
              const active = checkinReward === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.checkinPill,
                    active && styles.checkinPillActive,
                  ]}
                  onPress={() => setCheckinReward(r.key)}
                  activeOpacity={0.85}>
                  <Ionicons
                    name={r.icon}
                    size={13}
                    color={active ? '#C4F27F' : 'rgba(255,255,255,0.65)'}
                  />
                  <Text
                    style={[
                      styles.checkinPillText,
                      active && styles.checkinPillTextActive,
                    ]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>ELIGIBILITY</Text>
          <View style={styles.pillRow}>
            {ELIGIBILITY_OPTIONS.map((e) => {
              const active = eligibility === e.key;
              return (
                <TouchableOpacity
                  key={e.key}
                  activeOpacity={0.85}
                  style={[
                    styles.eligPill,
                    active && styles.eligPillActive,
                  ]}
                  onPress={() => setEligibility(e.key)}>
                  <Ionicons
                    name={e.icon}
                    size={12}
                    color={active ? '#C4F27F' : 'rgba(255,255,255,0.65)'}
                  />
                  <Text
                    style={[
                      styles.eligPillText,
                      active && styles.eligPillTextActive,
                    ]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {(isDiscount || isFreeItem || isBounty) && (
            <>
              <Text style={styles.fieldLabel}>APPLIES TO CATEGORIES</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillRow}>
                {CATEGORIES.map((c) => {
                  const active = appliesTags.has(c);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => toggleAppliesTag(c)}
                      activeOpacity={0.85}>
                      <Text
                        style={[
                          styles.pillText,
                          active && styles.pillTextActive,
                        ]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Text style={styles.hintText}>
                Leave empty to apply to the whole menu.
              </Text>
            </>
          )}

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Stackable with other offers</Text>
              <Text style={styles.toggleSub}>
                Customers can combine this with happy-hour & member discounts.
              </Text>
            </View>
            <Switch
              value={stackable}
              onValueChange={setStackable}
              trackColor={{ false: '#2a2a2a', true: '#C4F27F' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.fieldLabel}>
            NOTIFICATION MESSAGE{' '}
            <Text style={styles.optional}>(OPTIONAL)</Text>
          </Text>
          <View style={styles.input}>
            <TextInput
              style={styles.inputText}
              value={notification}
              onChangeText={setNotification}
              placeholder="Push sent to nearby fans when this goes live"
              placeholderTextColor="rgba(255,255,255,0.35)"
              maxLength={90}
            />
          </View>
          <Text style={styles.hintText}>
            {notification.length}/90 characters
          </Text>

          <Text style={styles.fieldLabel}>
            TERMS &amp; CONDITIONS{' '}
            <Text style={styles.optional}>(OPTIONAL)</Text>
          </Text>
          <View style={[styles.input, styles.inputMultiWrap]}>
            <TextInput
              style={[styles.inputText, styles.inputMulti]}
              value={terms}
              onChangeText={setTerms}
              placeholder="Dine-in only, can't be combined with X, ID required, etc."
              placeholderTextColor="rgba(255,255,255,0.35)"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={14} color="#C4F27F" />
            <Text style={styles.tipText}>{TIPS[type]}</Text>
          </View>

          <SectionHeader label="Preview — How it appears to customers" />
          <View style={styles.previewCard}>
            <View style={styles.previewTopRow}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {previewTitle}
              </Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.previewMeta}>
              Sunset Taco Co · Check in within 1 hr on DATE to claim
            </Text>
            <Text style={styles.previewBullet}>· {previewLine}</Text>
            {checkinReward !== 'none' && (
              <Text style={styles.previewBullet}>
                · {CHECKIN_REWARDS.find((c) => c.key === checkinReward)?.label}{' '}
                included
              </Text>
            )}
            <View style={styles.previewFooter}>
              <View style={styles.previewFootItem}>
                <Ionicons name="time-outline" size={12} color="#C4F27F" />
                <Text style={styles.previewFootText}>
                  {duration === '30min' ? '30 min' : duration === '1hr' ? '1 hr' : duration === '2hr' ? '2 hr' : '3 hr'} window
                </Text>
              </View>
              <View style={styles.previewFootItem}>
                <Ionicons name="people-outline" size={12} color="#C4F27F" />
                <Text style={styles.previewFootText}>
                  {maxRedemptions || '∞'} max uses
                </Text>
              </View>
              <View style={styles.previewFootItem}>
                <Ionicons name="flash-outline" size={12} color="#C4F27F" />
                <Text style={styles.previewFootText}>Live now</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.publishBtn,
              (!canPublish || saving) && styles.publishBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!canPublish || saving}
            onPress={() => onSave(true)}>
            <Text style={styles.publishText}>
              {saving ? 'Saving…' : id ? 'Update deal' : 'Publish deal'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.draftBtn}
            activeOpacity={0.85}
            disabled={saving}
            onPress={() => onSave(false)}>
            <Text style={styles.draftText}>Save as draft</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {picker && (
        <DateTimePicker
          value={
            (picker.field === 'startDate'
              ? startDate
              : picker.field === 'endDate'
                ? endDate
                : picker.field === 'startTime'
                  ? startTime
                  : endTime) ?? new Date()
          }
          mode={picker.mode}
          is24Hour
          onChange={(event, selected) => {
            const field = picker.field;
            setPicker(null);
            if (event.type !== 'set' || !selected) return;
            if (field === 'startDate') setStartDate(selected);
            else if (field === 'endDate') setEndDate(selected);
            else if (field === 'startTime') setStartTime(selected);
            else setEndTime(selected);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function SmallField({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.input}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.inputText, prefix ? { paddingLeft: 4 } : null]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function combineDateTime(date: Date | null, time: Date | null): Date | null {
  if (!date) return null;
  const d = new Date(date);
  if (time) d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
function fmtDate(d: Date | null): string {
  return d ? `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}` : '';
}
function fmtTime(d: Date | null): string {
  return d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : '';
}

function PickerField({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.input} activeOpacity={0.8} onPress={onPress}>
        <Text
          style={[
            styles.inputText,
            { paddingVertical: 14, color: value ? '#fff' : 'rgba(255,255,255,0.3)' },
          ]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color="rgba(255,255,255,0.4)"
          style={{ paddingRight: 12 }}
        />
      </TouchableOpacity>
    </View>
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
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,179,0,0.1)',
    borderColor: 'rgba(255,179,0,0.35)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  pendingBannerText: {
    flex: 1,
    color: '#FFD479',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 8,
  },
  nameWrap: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C4F27F',
  },
  nameInput: {
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    gap: 6,
    minHeight: 90,
    justifyContent: 'center',
  },
  typeCardActive: {
    borderColor: '#C4F27F',
    backgroundColor: 'rgba(196,242,127,0.08)',
  },
  typeLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  typeLabelActive: {
    color: '#C4F27F',
  },
  typeSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
  },
  tripleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  heroCard: {
    width: '100%',
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    position: 'relative',
  },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#C4F27F',
  },
  heroBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  heroPlaceholderText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroPlaceholderSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  inputMultiWrap: {
    minHeight: 88,
    paddingVertical: 4,
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  optional: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 6,
  },
  eligPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eligPillActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderColor: '#C4F27F',
  },
  eligPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  eligPillTextActive: {
    color: '#C4F27F',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 18,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 46,
  },
  inputText: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#fff',
    minHeight: 46,
  },
  prefix: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    paddingLeft: 14,
  },
  suffix: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    paddingRight: 14,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderColor: '#C4F27F',
  },
  pillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#C4F27F',
    fontWeight: '700',
  },
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#C4F27F',
    borderColor: '#C4F27F',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 38,
  },
  dayCircleActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderColor: '#C4F27F',
  },
  dayText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#C4F27F',
  },
  sliderRow: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  multBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#C4F27F',
  },
  multBadgeText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4F27F',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C4F27F',
    borderWidth: 2,
    borderColor: '#000',
  },
  sliderLabels: {
    position: 'absolute',
    bottom: -22,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '600',
  },
  sliderQuickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickPillActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderColor: '#C4F27F',
  },
  quickPillText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '700',
  },
  quickPillTextActive: { color: '#C4F27F' },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rewardPillActive: {
    backgroundColor: 'rgba(196,242,127,0.15)',
    borderColor: '#C4F27F',
  },
  rewardPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  rewardPillTextActive: { color: '#C4F27F', fontWeight: '700' },
  checkinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: '45%',
  },
  checkinPillActive: {
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderColor: '#C4F27F',
  },
  checkinPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  checkinPillTextActive: { color: '#C4F27F', fontWeight: '700' },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(196,242,127,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.25)',
    marginTop: 18,
  },
  tipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  previewCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#C4F27F',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
  },
  liveText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  previewMeta: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 6,
  },
  previewBullet: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  previewFootItem: {
    alignItems: 'center',
    gap: 3,
  },
  previewFootText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  publishBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishText: { color: '#000', fontSize: 14, fontWeight: '800' },
  draftBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
