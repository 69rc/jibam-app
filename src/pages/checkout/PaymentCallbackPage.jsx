/**
 * PaymentCallbackPage
 *
 * Paystack redirects here after payment with ?reference=JIB-xxx in the URL.
 * We auto-verify the reference against our backend, then redirect to the
 * appropriate result page.
 *
 * The webhook already handles the DB update server-side, but we still call
 * verify here so the customer sees the result immediately without waiting.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { paymentAPI } from '../../services/api';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      navigate('/cart');
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentAPI.verify({ reference });
        const { payment, order } = res.data.data;
        const orderId = order?.id || payment?.orderId;

        if (payment?.status === 'success' || order?.paymentStatus === 'paid') {
          queryClient.invalidateQueries(['orders']);
          queryClient.invalidateQueries(['cart']);
          setStatus('success');
          setTimeout(() => {
            navigate('/order-success', {
              state: {
                orderId,
                orderNumber: order?.orderNumber,
              },
              replace: true,
            });
          }, 1800);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, []);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-primary-surface">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-primary font-semibold text-lg">Confirming your payment…</p>
        <p className="text-gray-500 text-sm">Please wait, do not close this page</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-primary-surface">
        <IoCheckmarkCircle size={80} className="text-primary" />
        <p className="text-2xl font-extrabold text-primary">Payment Confirmed!</p>
        <p className="text-gray-500 text-sm">Redirecting to your order…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-6 text-center bg-red-50">
      <IoCloseCircle size={80} className="text-red-500" />
      <p className="text-2xl font-extrabold text-red-600">Payment Not Confirmed</p>
      <p className="text-gray-500 text-sm">
        Your payment could not be verified. If money was deducted, it will be refunded automatically.
      </p>
      <button onClick={() => navigate('/orders')} className="btn-primary px-8 mt-2">
        Check My Orders
      </button>
    </div>
  );
}
