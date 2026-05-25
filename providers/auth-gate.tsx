import { useRouter, useSegments } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import { useMe } from '../hooks/use-auth';
import { setUnauthorizedHandler } from '../services/api';
import { guestStorage, merchantStorage } from '../services/storage';

const AUTH_ROUTES = new Set([
  'login',
  'otp',
  'email',
  'password',
  'name',
  'auth-callback',
]);

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { data: me, isLoading } = useMe();
  const [guestChecked, setGuestChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(guestStorage.isGuestSync());

  useEffect(() => {
    guestStorage.isGuest().then((v) => {
      setIsGuest(v);
      setGuestChecked(true);
    });
    merchantStorage.load();
    const unsub = guestStorage.subscribe(() => {
      setIsGuest(guestStorage.isGuestSync());
    });
    return unsub;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      guestStorage.disable();
      router.replace('/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  useEffect(() => {
    if (isLoading || !guestChecked) return;
    const first = segments[0] as string | undefined;
    const inAuthFlow = first && AUTH_ROUTES.has(first);

    if (!me && !isGuest && !inAuthFlow) {
      router.replace('/login');
    }
  }, [me, isGuest, isLoading, guestChecked, segments, router]);

  return <>{children}</>;
}
