import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type DrawerItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

export type DrawerSection = {
  key: string;
  title: string;
  items: DrawerItem[];
};

export type DrawerHeader = {
  name: string;
  tag: string;
  meta?: string;
  avatarColor?: string;
};

export function AppDrawer({
  visible,
  onClose,
  header,
  sections,
  bottomItems,
}: {
  visible: boolean;
  onClose: () => void;
  header: DrawerHeader;
  sections: DrawerSection[];
  bottomItems: DrawerItem[];
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topRow}>
          <Pressable
            hitSlop={12}
            onPress={onClose}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.avatar,
                header.avatarColor ? { backgroundColor: header.avatarColor } : null,
              ]}
            />
            <View style={styles.headerCol}>
              <Text style={styles.headerName}>{header.name}</Text>
              <View style={styles.headerMetaRow}>
                <View style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{header.tag}</Text>
                </View>
                {header.meta ? (
                  <Text style={styles.headerMeta}>{header.meta}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {sections.map((section) => (
            <View key={section.key} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <DrawerRow key={item.key} item={item} onClose={onClose} />
              ))}
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.section}>
            {bottomItems.map((item) => (
              <DrawerRow key={item.key} item={item} onClose={onClose} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DrawerRow({ item, onClose }: { item: DrawerItem; onClose: () => void }) {
  return (
    <Pressable
      onPress={() => {
        onClose();
        setTimeout(item.onPress, 50);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Ionicons
        name={item.icon}
        size={18}
        color={item.destructive ? '#E53935' : 'rgba(255,255,255,0.85)'}
      />
      <Text style={[styles.rowLabel, item.destructive && styles.rowLabelDanger]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  topRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 22,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerCol: { flex: 1 },
  headerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(196,242,127,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,242,127,0.4)',
  },
  tagPillText: {
    color: '#C4F27F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerMeta: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 18,
    marginTop: 14,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  rowPressed: {
    opacity: 0.5,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  rowLabelDanger: {
    color: '#E53935',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 14,
    marginHorizontal: 18,
  },
});
