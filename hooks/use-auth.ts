import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, unwrap } from '../services/api';
import { guestStorage, tokenStorage } from '../services/storage';
import type { AuthResponse, User } from '../services/types';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

type LoginResponse = {
  message: string;
  token: string;
};

type RegisterResponse = {
  message: string;
  user: User;
};

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const token = await tokenStorage.get();
      if (!token) return null;
      return unwrap(apiGet<User>('/auth/me'));
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await unwrap(
        apiPost<LoginResponse>('/auth/login', payload, false),
      );
      await tokenStorage.set(res.token);
      const me = await unwrap(apiGet<User>('/auth/me'));
      await guestStorage.disable();
      return me;
    },
    onSuccess: (me) => {
      qc.setQueryData(ME_QUERY_KEY, me);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      referralCode?: string;
    }) => {
      await unwrap(
        apiPost<RegisterResponse>('/auth/register', payload, false),
      );
      const login = await unwrap(
        apiPost<LoginResponse>('/auth/login', {
          email: payload.email,
          password: payload.password,
        }, false),
      );
      await tokenStorage.set(login.token);
      const me = await unwrap(apiGet<User>('/auth/me'));
      await guestStorage.disable();
      return me;
    },
    onSuccess: (me) => {
      qc.setQueryData(ME_QUERY_KEY, me);
    },
  });
}

export function useReferrals() {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: () => unwrap(apiGet<{ referralCode: string; referralCount: number }>('/users/referrals')),
    staleTime: 2 * 60 * 1000,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return async () => {
    await tokenStorage.clear();
    await guestStorage.disable();
    qc.setQueryData(ME_QUERY_KEY, null);
    qc.clear();
  };
}
