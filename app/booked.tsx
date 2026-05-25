import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
  TSpan,
} from 'react-native-svg';

const TABLE_NUMBER = '002';
const QR_URI = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=TABLE-${TABLE_NUMBER}`;

export default function BookedScreen() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const onDone = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.topArea}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.close}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Your Table is Booked</Text>
      </SafeAreaView>

      <View style={styles.middle}>
        {step === 1 && <BunnyScene />}
        {step === 2 && (
          <View style={styles.qrWrap}>
            <View style={styles.qrTile}>
              <Image source={{ uri: QR_URI }} style={styles.qr} />
            </View>
            <Text style={styles.qrNote}>
              Share this QR code at the reception while checking in
            </Text>
          </View>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        <Text style={styles.tableNum}>Table Number - {TABLE_NUMBER}</Text>
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

function BunnyScene() {
  return (
    <Svg width={300} height={300} viewBox="0 0 300 300">
      <Defs>
        <RadialGradient id="glow" cx="150" cy="150" r="140" fx="150" fy="150">
          <Stop offset="0%" stopColor="#FFE08A" stopOpacity="0.55" />
          <Stop offset="60%" stopColor="#E5A24A" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#000" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Circle cx="150" cy="150" r="140" fill="url(#glow)" />

      <G opacity="0.9">
        <Circle cx="40" cy="55" r="3" fill="#FFD36E" />
        <Circle cx="60" cy="35" r="2.2" fill="#F58FB0" />
        <Circle cx="255" cy="50" r="3" fill="#FFD36E" />
        <Circle cx="275" cy="80" r="2.2" fill="#9DD6F2" />
        <Circle cx="30" cy="170" r="2.4" fill="#C4F27F" />
        <Circle cx="270" cy="195" r="2.6" fill="#F58FB0" />
        <Path
          d="M50 90 l4 -4 M52 88 l-4 -4"
          stroke="#FFD36E"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <Path
          d="M250 110 l4 -4 M252 108 l-4 -4"
          stroke="#9DD6F2"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </G>

      <G>
        <Path
          d="M118 80 Q112 50 128 40 Q140 50 134 90 Z"
          fill="#F5F5F5"
          stroke="#222"
          strokeWidth="1.2"
        />
        <Path
          d="M122 78 Q120 58 128 50 Q132 60 130 84 Z"
          fill="#F58FB0"
        />
        <Path
          d="M166 80 Q172 50 156 40 Q144 50 150 90 Z"
          fill="#F5F5F5"
          stroke="#222"
          strokeWidth="1.2"
        />
        <Path
          d="M162 78 Q164 58 156 50 Q152 60 154 84 Z"
          fill="#F58FB0"
        />
      </G>

      <Ellipse cx="142" cy="115" rx="42" ry="36" fill="#FFFFFF" stroke="#222" strokeWidth="1.2" />

      <Ellipse cx="128" cy="112" rx="9" ry="11" fill="#FFFFFF" stroke="#222" strokeWidth="1" />
      <Ellipse cx="156" cy="112" rx="9" ry="11" fill="#FFFFFF" stroke="#222" strokeWidth="1" />
      <Circle cx="128" cy="114" r="4" fill="#1A1A1A" />
      <Circle cx="156" cy="114" r="4" fill="#1A1A1A" />
      <Circle cx="129.5" cy="112.5" r="1.2" fill="#fff" />
      <Circle cx="157.5" cy="112.5" r="1.2" fill="#fff" />

      <Path
        d="M138 124 Q142 128 146 124 Q144 130 142 130 Q140 130 138 124 Z"
        fill="#F58FB0"
        stroke="#222"
        strokeWidth="0.8"
      />
      <Path
        d="M142 130 Q138 138 132 136"
        stroke="#222"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M142 130 Q146 138 152 136"
        stroke="#222"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      <Ellipse cx="118" cy="125" rx="6" ry="3.5" fill="#FFB3C7" opacity="0.7" />
      <Ellipse cx="166" cy="125" rx="6" ry="3.5" fill="#FFB3C7" opacity="0.7" />

      <Ellipse cx="142" cy="170" rx="40" ry="30" fill="#FFFFFF" stroke="#222" strokeWidth="1.2" />

      <G>
        <Path
          d="M108 175 q-14 -4 -22 6 q-2 8 6 12 q10 4 22 -6 Z"
          fill="#FFFFFF"
          stroke="#222"
          strokeWidth="1.2"
        />
        <Path
          d="M176 175 q14 -4 22 6 q2 8 -6 12 q-10 4 -22 -6 Z"
          fill="#FFFFFF"
          stroke="#222"
          strokeWidth="1.2"
        />
      </G>

      <G>
        <Rect
          x="98"
          y="158"
          width="92"
          height="34"
          rx="3"
          fill="#C98A3F"
          stroke="#6B3D14"
          strokeWidth="2"
        />
        <Rect
          x="102"
          y="162"
          width="84"
          height="26"
          rx="2"
          fill="#B4762F"
          stroke="#6B3D14"
          strokeWidth="0.8"
        />
        <SvgText
          x="144"
          y="180"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="800"
          textAnchor="middle"
          letterSpacing="2">
          <TSpan>RESERVED</TSpan>
        </SvgText>
      </G>

      <G>
        <Path
          d="M40 235 Q150 215 260 235 L255 250 Q150 232 45 250 Z"
          fill="#F4C9D4"
          stroke="#C98AA0"
          strokeWidth="1"
        />
        <Path
          d="M45 250 Q150 268 255 250 L250 270 Q150 280 50 270 Z"
          fill="#E69EB0"
          stroke="#A86F84"
          strokeWidth="1"
        />
      </G>

      <G>
        <Rect x="92" y="215" width="6" height="22" fill="#F2F2F2" stroke="#222" strokeWidth="0.8" />
        <Ellipse cx="95" cy="212" rx="3.4" ry="6" fill="#FFB347" />
        <Ellipse cx="95" cy="210" rx="1.4" ry="3" fill="#FFEDB8" />
        <Rect x="202" y="215" width="6" height="22" fill="#F2F2F2" stroke="#222" strokeWidth="0.8" />
        <Ellipse cx="205" cy="212" rx="3.4" ry="6" fill="#FFB347" />
        <Ellipse cx="205" cy="210" rx="1.4" ry="3" fill="#FFEDB8" />
      </G>

      <G>
        <Path
          d="M150 220 q-8 -2 -10 -10 q6 -2 10 4 q4 -6 10 -4 q-2 8 -10 10 Z"
          fill="#2F7D3A"
        />
        <Circle cx="150" cy="222" r="8" fill="#D63247" stroke="#8C1F2D" strokeWidth="1" />
        <Path
          d="M147 220 q3 -4 6 0 q-3 4 -6 0 Z"
          fill="#F26B7E"
        />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topArea: {},
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 6,
    marginLeft: 20,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  qrWrap: {
    alignItems: 'center',
  },
  qrTile: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
  },
  qr: {
    width: 220,
    height: 220,
  },
  qrNote: {
    marginTop: 18,
    fontSize: 11,
    color: '#9B9B9B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  tableNum: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 14,
  },
  doneBtn: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    width: '88%',
  },
  doneText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 10,
  },
});
