import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IoCheckmarkCircle, IoCloseCircle, IoOpenOutline, IoCardOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { paymentAPI } from '../../services/api';
import { PageSpinner } from '../../components/common/Spinner';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { orderId, orderTotal, paymentMethod = 'paystack' } = location.state || {};

  const [paymentUrl, setPaymentUrl] = useState(null);
  const [reference, setReference] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState('init'); // init | pending | success | failed

  const initMutation = useMutation({
    mutationFn: () => {
      if (paymentMethod === 'opay') {
        return paymentAPI.initializeOPay({ orderId });
      }
      return paymentAPI.initialize({ orderId });
    },
    onSuccess: (res) => {
      const { authorizationUrl, paymentUrl: opayUrl, reference: ref } = res.data.data;
      setPaymentUrl(opayUrl || authorizationUrl);
      setReference(ref);
      setStep('pending');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Payment initialization failed');
      setStep('failed');
    },
  });

  useEffect(() => {
    if (!orderId) { navigate('/cart'); return; }
    initMutation.mutate();
  }, []);

  const handleOpenPaystack = () => {
    if (paymentUrl) window.open(paymentUrl, '_blank');
  };

  const handleVerify = async () => {
    if (!reference) return;
    setVerifying(true);
    try {
      const res = paymentMethod === 'opay'
        ? await paymentAPI.verifyOPay(reference)
        : await paymentAPI.verify({ reference });
      const { payment } = res.data.data;
      if (payment.status === 'success') {
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['cart']);
        setStep('success');
        setTimeout(() => {
          navigate('/order-success', {
            state: { orderId, orderNumber: res.data.data.order?.orderNumber },
          });
        }, 1500);
      } else {
        setStep('failed');
        toast.error('Payment not confirmed yet. Please retry.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
      setStep('failed');
    } finally {
      setVerifying(false);
    }
  };

  if (step === 'init' || initMutation.isPending) return <PageSpinner message="Initializing payment…" />;

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-28 h-28 rounded-full bg-navy-surface flex items-center justify-center">
          <IoCheckmarkCircle size={72} className="text-navy" />
        </div>
        <h2 className="text-2xl font-extrabold text-navy">Payment Successful!</h2>
        <p className="text-gray-500">Redirecting to your order…</p>
        <div className="w-6 h-6 border-2 border-gray-200 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-28 h-28 rounded-full bg-red-50 flex items-center justify-center">
          <IoCloseCircle size={72} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-red-600">Payment Failed</h2>
        <p className="text-gray-500">Something went wrong. Please try again.</p>
        <button
          onClick={() => { setStep('init'); initMutation.mutate(); }}
          className="btn-primary px-8"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-navy">Complete Payment</h1>

      {/* Amount card */}
      <div className="bg-navy rounded-2xl p-6 text-center flex flex-col gap-1">
        <p className="text-white/70 text-sm">Amount to Pay</p>
        <p className="text-4xl font-black text-white">₦{Number(orderTotal).toLocaleString()}</p>
        <p className="text-white/50 text-xs">Order #{orderId?.slice(-8).toUpperCase()}</p>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-navy mb-4">How to complete payment</h3>
        <div className="flex flex-col gap-3">
          {[
            { icon: IoOpenOutline, text: `Click "Pay with ${paymentMethod === 'opay' ? 'OPay' : 'Paystack'}" below` },
            { icon: IoCardOutline, text: `Complete payment on the ${paymentMethod === 'opay' ? 'OPay' : 'Paystack'} page` },
            { icon: IoCheckmarkCircle, text: 'Return here and click "I\'ve Paid"' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-navy-surface flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-extrabold text-navy">{i + 1}</span>
              </div>
              <s.icon size={17} className="text-navy flex-shrink-0" />
              <span className="text-sm text-gray-600">{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleOpenPaystack}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <IoOpenOutline size={18} />
        Pay with {paymentMethod === 'opay' ? 'OPay' : 'Paystack'}
      </button>

      <button
        onClick={handleVerify}
        disabled={verifying}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        {verifying ? (
          <span className="inline-block w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
        ) : "I've Paid — Confirm"}
      </button>

      <button
        onClick={() => navigate('/cart')}
        className="text-sm text-gray-400 hover:text-navy text-center transition"
      >
        Cancel & Go Back
      </button>
    </div>
  );
}
