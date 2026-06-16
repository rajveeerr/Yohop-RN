import { useMe } from '@/hooks/use-auth';
import { useUpdateProfile, useUploadAvatar } from '@/hooks/use-profile';
import { useStoredMerchantProfile } from '@/stores/merchant-draft';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const merchantProfile = useStoredMerchantProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [fullName, setFullName] = useState(me?.name ?? 'Your Name');
  const [username, setUsername] = useState(
    me?.email?.split('@')[0] ?? 'user_.01',
  );
  const [bio, setBio] = useState(
    "Avid foodie, gig-goer and spa enthusiast. Delhi's Best spots, one tap at a time.",
  );
  const [linkA, setLinkA] = useState('');
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const isPro = !!merchantProfile;
  const busy = updateProfile.isPending || uploadAvatar.isPending;

  const onPickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow access to your photo library to change your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalAvatar(uri);
      try {
        await uploadAvatar.mutateAsync(uri);
      } catch (e: any) {
        Alert.alert('Upload failed', e?.message ?? 'Could not upload avatar.');
        setLocalAvatar(null);
      }
    }
  };

  const onSave = async () => {
    try {
      await updateProfile.mutateAsync({ name: fullName, bio });
      router.back();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Could not save profile.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, busy && { opacity: 0.6 }]}
          activeOpacity={0.85}
          disabled={busy}
          onPress={onSave}>
          {busy ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity style={styles.avatar} activeOpacity={0.85} onPress={onPickAvatar}>
              {localAvatar || me?.avatar ? (
                <Image
                  source={{ uri: localAvatar ?? me?.avatar! }}
                  style={styles.avatarImg}
                />
              ) : (
                <Ionicons name="camera-outline" size={22} color="#fff" />
              )}
              {uploadAvatar.isPending && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Change Profile Photo</Text>
          </View>

          <Field
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
          />

          <Field
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            prefix="@"
            autoCapitalize="none"
          />

          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="A little about you"
            multiline
          />

          <Text style={styles.sectionLabel}>Social Links</Text>
          <View style={styles.linkRow}>
            <Ionicons
              name="link-outline"
              size={16}
              color="rgba(255,255,255,0.55)"
              style={{ marginLeft: 12 }}
            />
            <TextInput
              style={styles.linkInput}
              value={linkA}
              onChangeText={setLinkA}
              placeholder=""
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.addLinkRow}>
            <Ionicons name="add-circle" size={16} color="#C4F27F" />
            <Text style={styles.addLinkText}>Add another link</Text>
          </TouchableOpacity>

          <View style={styles.privateRow}>
            <Text style={styles.sectionLabel}>Private Information</Text>
            <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.45)" />
          </View>
          <Field
            label="Email Address"
            value={me?.email ?? 'user@yohop.app'}
            onChangeText={() => {}}
            placeholder=""
            editable={false}
          />
          <Text style={styles.privateNote}>
            Email cannot be changed here. Contact support to update.
          </Text>

          <TouchableOpacity
            style={styles.switchBtn}
            activeOpacity={0.85}
            onPress={() =>
              isPro
                ? router.replace('/(merchant)' as never)
                : router.push('/merchant-onboarding')
            }>
            <Text style={styles.switchBtnText}>
              {isPro ? 'Open Professional Dashboard' : 'Switch to Professional Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.deactivateRow}>
            <Text style={styles.deactivateText}>
              Temporarily Deactivate Account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  prefix,
  editable,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  multiline?: boolean;
  prefix?: string;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMulti,
            !editable && editable !== undefined && styles.inputReadonly,
            prefix ? { paddingLeft: 4 } : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.35)"
          multiline={multiline}
          editable={editable !== false}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    paddingHorizontal: 16,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  avatarWrap: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
  fieldGroup: { marginTop: 14 },
  fieldLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  prefix: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    minHeight: 46,
    fontSize: 13,
    color: '#fff',
  },
  inputMulti: {
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputReadonly: {
    color: 'rgba(255,255,255,0.5)',
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  linkInput: {
    flex: 1,
    paddingHorizontal: 12,
    minHeight: 46,
    fontSize: 13,
    color: '#fff',
  },
  addLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 4,
  },
  addLinkText: {
    color: '#C4F27F',
    fontSize: 12,
    fontWeight: '700',
  },
  privateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 0,
  },
  privateNote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
  switchBtn: {
    marginTop: 28,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C4F27F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  deactivateRow: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  deactivateText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
});
