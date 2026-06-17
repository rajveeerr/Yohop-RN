import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONFETTI = [
  { left: '10%', top: 8, color: '#C4F27F', size: 10, rot: '20deg' },
  { left: '22%', top: 26, color: '#FFB300', size: 8, rot: '-30deg' },
  { left: '34%', top: 2, color: '#AE80FF', size: 12, rot: '15deg' },
  { left: '48%', top: 32, color: '#FF6B6B', size: 10, rot: '-10deg' },
  { left: '62%', top: 10, color: '#7AD6FF', size: 8, rot: '40deg' },
  { left: '76%', top: 28, color: '#C4F27F', size: 12, rot: '-25deg' },
  { left: '88%', top: 6, color: '#FFB300', size: 9, rot: '12deg' },
  { left: '16%', top: 60, color: '#AE80FF', size: 7, rot: '50deg' },
  { left: '40%', top: 70, color: '#FF6B6B', size: 11, rot: '-40deg' },
  { left: '58%', top: 56, color: '#C4F27F', size: 8, rot: '20deg' },
  { left: '78%', top: 66, color: '#7AD6FF', size: 10, rot: '-15deg' },
] as const;

export default function CheckinCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string;
    title?: string;
    tickets?: string;
    pointsAwarded?: string;
    streakDays?: string;
    rewardTitle?: string;
    rewardDesc?: string;
  }>();
  const ticketsCount = Math.max(1, Number(params.tickets || '1'));
  const pointsAwarded = Number(params.pointsAwarded ?? 0);
  const streakDays = Number(params.streakDays ?? 0);
  const rewardTitle = params.rewardTitle || '';
  const rewardDesc = params.rewardDesc || '';

  const scale = useRef(new Animated.Value(0.6)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiFall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 120,
      }),
      Animated.timing(confettiOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(confettiFall, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ring, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ring, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scale, ring, confettiOpacity, confettiFall]);

  const ringScale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });
  const ringOpacity = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.confettiArea}>
        {CONFETTI.map((c, i) => {
          const translateY = confettiFall.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.confetti,
                {
                  left: c.left as any,
                  top: c.top,
                  width: c.size,
                  height: c.size * 1.5,
                  backgroundColor: c.color,
                  transform: [{ rotate: c.rot }, { translateY }],
                  opacity: confettiOpacity,
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <View style={styles.headerCol}>
          <Text style={styles.topTitle}>Check-in</Text>
          <Text style={styles.topTitleSecond}>complete</Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkRing,
            { transform: [{ scale }] },
          ]}>
          <Animated.View
            style={[
              styles.checkPulse,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          <View style={styles.checkInner}>
            <Ionicons name="checkmark" size={42} color="#000" />
          </View>
          {ticketsCount > 1 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>1/{ticketsCount}</Text>
            </View>
          )}
        </Animated.View>

        <Text style={styles.title}>You&apos;re checked in!</Text>
        <Text style={styles.sub}>
          {pointsAwarded > 0
            ? `+${pointsAwarded} points earned${streakDays > 0 ? ` - ${streakDays}-day streak` : ''}`
            : 'Have an amazing time.'}
        </Text>

        {rewardTitle ? (
          <View style={styles.surpriseCard}>
            <Text style={styles.surpriseTag}>REWARD UNLOCKED</Text>
            <Text style={styles.surpriseTitle}>{rewardTitle}</Text>
            {rewardDesc ? (
              <Text style={styles.surpriseText}>{rewardDesc}</Text>
            ) : null}
            <View style={styles.drinkRow}>
              <View style={styles.drinkPill}>
                <Ionicons name="gift-outline" size={13} color="#C4F27F" />
                <Text style={styles.drinkText}>Show to staff</Text>
              </View>
            </View>
          </View>
        ) : pointsAwarded > 0 ? (
          <View style={styles.surpriseCard}>
            <Text style={styles.surpriseTag}>POINTS EARNED</Text>
            <Text style={styles.surpriseTitle}>+{pointsAwarded} points added</Text>
            {streakDays > 0 && (
              <Text style={styles.surpriseText}>
                You&apos;re on a {streakDays}-day check-in streak. Keep it up!
              </Text>
            )}
            <View style={styles.drinkRow}>
              <View style={styles.drinkPill}>
                <Ionicons name="flash" size={13} color="#C4F27F" />
                <Text style={styles.drinkText}>Streak: {streakDays} days</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  confettiArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 30,
    height: 100,
    zIndex: 0,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 2,
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
  headerCol: { alignItems: 'center' },
  topTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  topTitleSecond: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  checkRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(196,242,127,0.18)',
    borderWidth: 2,
    borderColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  checkPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#C4F27F',
  },
  checkInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#000',
    borderWidth: 1.5,
    borderColor: '#C4F27F',
  },
  countBadgeText: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  surpriseCard: {
    width: '100%',
    marginTop: 24,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.3)',
  },
  surpriseTag: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  surpriseTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  surpriseText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  drinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(196,242,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  drinkText: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '800',
  },
  validText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
