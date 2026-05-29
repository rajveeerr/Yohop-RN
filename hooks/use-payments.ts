import { useMutation } from '@tanstack/react-query';
import { apiPost, unwrap } from '../services/api';
import type {
  PaymentPurpose,
  PaymentTransaction,
} from '../services/types';

export type { PaymentPurpose } from '../services/types';

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (payload: {
      amount: number;
      currency?: string;
      purpose: PaymentPurpose;
      referenceId?: string;
    }) =>
      unwrap(
        apiPost<PaymentTransaction>('/payments/intent', {
          currency: 'USD',
          ...payload,
        }),
      ),
  });
}

export function useCapturePayment() {
  return useMutation({
    mutationFn: (payload: { orderId: string; paymentId?: string }) =>
      unwrap(apiPost<PaymentTransaction>('/payments/capture', payload)),
  });
}
