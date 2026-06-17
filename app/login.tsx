import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '@/hooks/use-auth';
import { guestStorage, merchantStorage } from '@/services/storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  const onSignIn = async () => {
    setError(null);
    try {
      await login.mutateAsync({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    }
  };

  const onGuest = async () => {
    await guestStorage.enable();
    router.replace('/(tabs)/explore' as never);
  };

  const onListBusiness = async () => {
    await guestStorage.enable();
    const existing = await merchantStorage.load();
    if (existing) {
      router.replace('/(merchant)' as never);
    } else {
      router.push('/merchant-onboarding');
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0 && !login.isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require('@/assets/images/green-icon.png')}
        style={styles.greenIcon}
        contentFit="contain"
      />

      <View style={styles.container}>
        <Text style={styles.title}>Welcome{'\n'}back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9A9A9A"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#9A9A9A"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eye}
            onPress={() => setShowPassword((s) => !s)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.continueButton, !canSubmit && styles.disabled]}
          activeOpacity={0.8}
          onPress={onSignIn}
          disabled={!canSubmit}>
          {login.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          activeOpacity={0.85}
          onPress={onGuest}>
          <Text style={styles.guestText}>Continue as guest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.merchantButton}
          activeOpacity={0.85}
          onPress={onListBusiness}>
          <Ionicons name="storefront-outline" size={18} color="#000" style={styles.merchantIcon} />
          <Text style={styles.merchantText}>List your business</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupRow}
          onPress={() => router.push('/email')}>
          <Text style={styles.signupText}>
            New to YOHOP? <Text style={styles.signupLink}>Create account</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <FontAwesome name="apple" size={20} color="#000" style={styles.socialIcon} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <FontAwesome name="facebook" size={20} color="#1877F2" style={styles.socialIcon} />
          <Text style={styles.socialText}>Continue with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <RNImage
            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  greenIcon: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 200,
    height: 180,
    zIndex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 180,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 28,
    lineHeight: 34,
    zIndex: 2,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    color: '#000',
    marginBottom: 12,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 0,
    height: 50,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  disabled: { opacity: 0.5 },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 12,
  },
  guestText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  merchantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C4F27F',
    borderRadius: 8,
    height: 50,
    marginBottom: 12,
  },
  merchantIcon: {
    marginRight: 8,
  },
  merchantText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  signupRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  signupText: {
    fontSize: 13,
    color: '#666',
  },
  signupLink: {
    color: '#000',
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9A9A9A',
    fontSize: 13,
    fontStyle: 'italic',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    height: 50,
    marginBottom: 12,
  },
  socialIcon: {
    marginRight: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
});
