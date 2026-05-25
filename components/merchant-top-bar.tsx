import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function MerchantTopBar({
  title,
  onMenu,
  onBell,
  showBell = true,
}: {
  title: string;
  onMenu: () => void;
  onBell?: () => void;
  showBell?: boolean;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        hitSlop={10}
        onPress={onMenu}
        style={styles.iconBtn}
        activeOpacity={0.7}>
        <Ionicons name="menu" size={22} color="#fff" />
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {showBell ? (
        <TouchableOpacity
          hitSlop={10}
          onPress={onBell}
          style={styles.iconBtn}
          activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.dot} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
  },
});
