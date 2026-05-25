import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

export default function PaidScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();
  const total = amount ?? '20.04';
  const [step, setStep] = useState<0 | 1>(0);

  const onDone = () => {
    if (step === 0) setStep(1);
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <TouchableOpacity
          hitSlop={10}
          onPress={() => router.replace('/(tabs)')}
          style={styles.close}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>
          You&apos;ve paid the dinner{'\n'}bill for{' '}
          <Text style={styles.amount}>${total}</Text>
        </Text>
      </SafeAreaView>

      <View style={styles.middle}>{step === 1 && <PaidScene />}</View>

      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={0.9}
          onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <View style={styles.homeIndicator} />
      </SafeAreaView>
    </View>
  );
}

function PaidScene() {
  return (
    <Svg width={300} height={260} viewBox="0 0 320 280">
      <G opacity="0.9">
        <Circle cx="40" cy="60" r="3" fill="#FFD36E" />
        <Circle cx="78" cy="38" r="2.4" fill="#F58FB0" />
        <Circle cx="240" cy="48" r="2.8" fill="#9DD6F2" />
        <Circle cx="278" cy="78" r="2.4" fill="#C4F27F" />
        <Path
          d="M48 88 l5 -5 M53 83 l-5 -5"
          stroke="#FFD36E"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <Path
          d="M270 100 l5 -5 M275 95 l-5 -5"
          stroke="#9DD6F2"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </G>

      <Path
        d="M48 140 L62 110 L54 124 L70 100 L60 132 L74 118"
        stroke="#FFC83D"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M272 140 L258 110 L266 124 L250 100 L260 132 L246 118"
        stroke="#FFC83D"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <G fill="#9D4EDD" stroke="#5D2A91" strokeWidth="1.6">
        <Path d="M18 195 q-4 -28 18 -34 q14 -2 22 8 q6 16 -2 28 q-12 12 -28 8 q-10 -2 -10 -10 Z" />
        <Path
          d="M30 180 q4 -8 12 -8"
          stroke="#5D2A91"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M30 188 q4 -4 12 -4"
          stroke="#5D2A91"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </G>
      <G fill="#9D4EDD" stroke="#5D2A91" strokeWidth="1.6">
        <Path d="M302 195 q4 -28 -18 -34 q-14 -2 -22 8 q-6 16 2 28 q12 12 28 8 q10 -2 10 -10 Z" />
        <Path
          d="M290 180 q-4 -8 -12 -8"
          stroke="#5D2A91"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M290 188 q-4 -4 -12 -4"
          stroke="#5D2A91"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
      </G>

      <Path
        d="M60 150 Q60 70 160 70 Q260 70 260 150 Z"
        fill="#C46AB8"
        stroke="#6E2C75"
        strokeWidth="2"
      />
      <Path
        d="M85 130 Q90 92 140 88"
        stroke="#D78BC7"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      <Rect
        x="142"
        y="92"
        width="36"
        height="36"
        rx="3"
        fill="#C4F27F"
        stroke="#1A4F1A"
        strokeWidth="1.5"
      />
      <G fill="#1A4F1A">
        <Rect x="146" y="96" width="6" height="6" />
        <Rect x="156" y="96" width="6" height="6" />
        <Rect x="168" y="96" width="6" height="6" />
        <Rect x="146" y="108" width="6" height="6" />
        <Rect x="168" y="108" width="6" height="6" />
        <Rect x="146" y="120" width="6" height="6" />
        <Rect x="156" y="120" width="6" height="6" />
        <Rect x="168" y="120" width="6" height="6" />
      </G>

      <Ellipse
        cx="160"
        cy="220"
        rx="135"
        ry="22"
        fill="#FFFFFF"
        stroke="#222"
        strokeWidth="1.6"
      />
      <Ellipse cx="160" cy="217" rx="135" ry="3" fill="#E0E0E0" />

      <G>
        <Path
          d="M144 168 q-5 -22 3 -32 q8 6 8 28 Z"
          fill="#FFFFFF"
          stroke="#222"
          strokeWidth="1.2"
        />
        <Path
          d="M147 165 q-3 -14 2 -22 q3 8 3 20 Z"
          fill="#F58FB0"
        />
        <Path
          d="M176 168 q5 -22 -3 -32 q-8 6 -8 28 Z"
          fill="#FFFFFF"
          stroke="#222"
          strokeWidth="1.2"
        />
        <Path
          d="M173 165 q3 -14 -2 -22 q-3 8 -3 20 Z"
          fill="#F58FB0"
        />

        <Ellipse
          cx="160"
          cy="190"
          rx="28"
          ry="22"
          fill="#FFFFFF"
          stroke="#222"
          strokeWidth="1.2"
        />

        <Path
          d="M148 187 q4 -4 8 0"
          stroke="#222"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M164 187 q4 -4 8 0"
          stroke="#222"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        <Ellipse cx="160" cy="200" rx="6" ry="5" fill="#1A1A1A" />
        <Ellipse cx="160" cy="202" rx="4" ry="2.6" fill="#E53935" />

        <Ellipse
          cx="142"
          cy="198"
          rx="4"
          ry="2.4"
          fill="#FFB3C7"
          opacity="0.75"
        />
        <Ellipse
          cx="178"
          cy="198"
          rx="4"
          ry="2.4"
          fill="#FFB3C7"
          opacity="0.75"
        />
      </G>

      <G>
        <Rect
          x="92"
          y="200"
          width="38"
          height="20"
          rx="3"
          fill="#2BB673"
          stroke="#13502E"
          strokeWidth="1.5"
        />
        <Rect x="92" y="200" width="38" height="6" fill="#1F8553" />
        <Circle cx="103" cy="214" r="1.4" fill="#1F4F2A" />
        <Circle cx="119" cy="214" r="1.4" fill="#1F4F2A" />
        <Path
          d="M107 217 q4 3 8 0"
          stroke="#1F4F2A"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <SvgText
          x="111"
          y="207"
          fill="#fff"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle">
          $
        </SvgText>
      </G>

      <G>
        <Ellipse
          cx="208"
          cy="220"
          rx="22"
          ry="6"
          fill="#D4A574"
          stroke="#8B5A2B"
          strokeWidth="1.2"
        />
        <Rect x="186" y="208" width="44" height="6" fill="#7BAA3C" />
        <Rect x="186" y="202" width="44" height="6" fill="#C85042" />
        <Path
          d="M186 202 q22 -10 44 0 l0 2 l-44 0 Z"
          fill="#D4A574"
          stroke="#8B5A2B"
          strokeWidth="1.2"
        />
        <Circle cx="196" cy="198" r="1" fill="#FFF5D1" />
        <Circle cx="208" cy="196" r="1" fill="#FFF5D1" />
        <Circle cx="220" cy="198" r="1" fill="#FFF5D1" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    marginHorizontal: 22,
    lineHeight: 26,
  },
  amount: { color: '#C4F27F' },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  doneBtn: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    width: '88%',
  },
  doneText: { color: '#000', fontSize: 15, fontWeight: '700' },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 10,
  },
});
