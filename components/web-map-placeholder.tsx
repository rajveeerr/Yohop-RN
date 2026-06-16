import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WebMapPlaceholderProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function WebMapPlaceholder({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: WebMapPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.glowA} />
        <View style={styles.glowB} />

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="map-outline" size={28} color="#F4E7B4" />
          </View>
          <Text style={styles.kicker}>Web preview</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.actions}>
            <Link href={primaryHref as Href} asChild>
              <Pressable style={[styles.button, styles.buttonPrimary]}>
                <Text style={styles.buttonPrimaryText}>{primaryLabel}</Text>
              </Pressable>
            </Link>

            {secondaryHref && secondaryLabel ? (
              <Link href={secondaryHref as Href} asChild>
                <Pressable style={styles.button}>
                  <Text style={styles.buttonText}>{secondaryLabel}</Text>
                </Pressable>
              </Link>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08101F',
  },
  shell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  glowA: {
    position: 'absolute',
    top: -40,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(244, 231, 180, 0.14)',
  },
  glowB: {
    position: 'absolute',
    right: -70,
    bottom: -100,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 130, 158, 0.16)',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 28,
    padding: 28,
    backgroundColor: 'rgba(10, 20, 37, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 32,
    elevation: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 231, 180, 0.12)',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#8DA2BC',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#F4F7FB',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B6C6D8',
  },
  actions: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  buttonPrimary: {
    backgroundColor: '#F4E7B4',
    borderColor: '#F4E7B4',
  },
  buttonText: {
    color: '#F4F7FB',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPrimaryText: {
    color: '#08101F',
    fontSize: 14,
    fontWeight: '800',
  },
});