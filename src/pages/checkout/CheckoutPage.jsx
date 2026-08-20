import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoLocationOutline, IoCallOutline, IoChatbubbleOutline,
  IoPricetagOutline, IoCard, IoCheckmarkCircle, IoWarningOutline,
} from 'react-icons/io5';import toast from 'react-hot-toast';
import { orderAPI, cartAPI, addressAPI } from '../../services/api';
import api from '../../services/api';
import { PageSpinner } from '../../components/common/Spinner';
import { getDeliveryFee, DEFAULT_DELIVERY_ZONES } from '../../constants';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null); // full address object
  const [promoCode, setPromoCode] = useState('');

  const { control, handleSubmit, setValue, formState: { errors } } = useForm();

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.getCart().then((r) => r.data.data),
  });

  // Fetch zones from backend (admin-configurable)
  const { data: deliveryZones = DEFAULT_DELIVERY_ZONES } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => api.get('/settings/delivery-zones').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.getAll().then((r) => r.data.data),
    onSuccess: (data) => {
      const def = data?.find((a) => a.isDefault) || data?.[0];
      if (def && !selectedAddressId) {
        setSelectedAddressId(def.id);
        setSelectedAddress(def);
        setValue('deliveryAddress', `${def.street}, ${def.city}, ${def.state}`);
        setValue('deliveryPhone', def.phone);
      }
    },
  });

  // ── Dynamic delivery fee ──────────────────────────────────────────────
  const deliveryInfo = useMemo(() => {
    if (!selectedAddress) return { fee: 500, zone: null, outsideKano: false };
    return getDeliveryFee(deliveryZones, selectedAddress.state, selectedAddress.city);
  }, [selectedAddress, deliveryZones]);

  const createOrderMutation = useMutation({
    mutationFn: (data) => orderAPI.create({ ...data, paymentMethod: 'paystack' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      navigate('/payment', {
        state: { orderId: res.data.data.id, orderTotal: res.data.data.total },
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Order creation failed'),
  });

  const onSubmit = (formData) => {
    if (deliveryInfo.outsideKano) {
      toast.error('Sorry, we currently only deliver within Kano state.');
      return;
    }
    createOrderMutation.mutate({
      deliveryAddress: formData.deliveryAddress,
      deliveryPhone: formData.deliveryPhone,
      deliveryInstructions: formData.deliveryInstructions,
      deliveryCity: selectedAddress?.city || '',   // zone label for backend fee lookup
      promoCode: promoCode || undefined,
    });
  };

  const subtotal = cart?.subtotal || 0;
  const total = subtotal + deliveryInfo.fee;
  const items = cart?.items || [];

  if (!cart) return <PageSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary mb-6">Checkout</h1>

      <div className="flex flex-col gap-5">
        {/* ── Form ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Saved addresses */}
          {addresses && addresses.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-primary mb-3">Saved Addresses</h2>
              <div className="flex flex-col gap-2">
                {addresses.map((addr) => {
                  const info = getDeliveryFee(deliveryZones, addr.state, addr.city);
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setSelectedAddress(addr);
                        setValue('deliveryAddress', `${addr.street}, ${addr.city}, ${addr.state}`);
                        setValue('deliveryPhone', addr.phone);
                      }}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 transition text-left w-full
                        ${selectedAddressId === addr.id
                          ? 'border-primary bg-primary-surface'
                          : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${selectedAddressId === addr.id ? 'border-primary' : 'border-gray-300'}`}>
                        {selectedAddressId === addr.id && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-primary">{addr.label}</span>
                          {addr.isDefault && <span className="badge-navy text-[10px]">Default</span>}
                          {info.outsideKano ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                              Outside delivery zone
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-surface text-primary">
                              ₦{info.fee.toLocaleString()} delivery · {info.zone}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{addr.street}, {addr.city}, {addr.state}</p>
                        <p className="text-xs text-gray-400">📞 {addr.phone}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Outside Kano warning */}
          {deliveryInfo.outsideKano && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <IoWarningOutline size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-600">Outside Delivery Zone</p>
                <p className="text-xs text-red-500 mt-0.5">
                  We currently only deliver within Kano state. Please add a Kano address to continue.
                </p>
              </div>
            </div>
          )}

          {/* Delivery details form */}
          <form onSubmit={handleSubmit(onSubmit)} id="checkout-form">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-primary mb-4">Delivery Details</h2>
              <div className="flex flex-col gap-4">

                {/* Delivery address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-primary">Delivery Address *</label>
                  <Controller
                    control={control}
                    name="deliveryAddress"
                    rules={{ required: 'Delivery address is required' }}
                    render={({ field }) => (
                      <div className="relative">
                        <IoLocationOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
                        <input
                          {...field}
                          placeholder="Street, City, State"
                          className={`input-field pl-9 text-sm ${errors.deliveryAddress ? 'border-red-400 bg-red-50' : ''}`}
                        />
                      </div>
                    )}
                  />
                  {errors.deliveryAddress && <p className="text-xs text-red-500">{errors.deliveryAddress.message}</p>}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-primary">Phone Number *</label>
                  <Controller
                    control={control}
                    name="deliveryPhone"
                    rules={{
                      required: 'Phone number is required',
                      pattern: { value: /^(\+?234|0)[789]\d{9}$/, message: 'Invalid Nigerian phone number' },
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <IoCallOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
                        <input
                          {...field}
                          placeholder="08012345678"
                          className={`input-field pl-9 text-sm ${errors.deliveryPhone ? 'border-red-400 bg-red-50' : ''}`}
                        />
                      </div>
                    )}
                  />
                  {errors.deliveryPhone && <p className="text-xs text-red-500">{errors.deliveryPhone.message}</p>}
                </div>

                {/* Instructions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-primary">
                    Delivery Instructions <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <Controller
                    control={control}
                    name="deliveryInstructions"
                    render={({ field }) => (
                      <div className="relative">
                        <IoChatbubbleOutline size={16} className="absolute left-3 top-3.5 text-accent" />
                        <input
                          {...field}
                          placeholder="e.g. Call on arrival…"
                          className="input-field pl-9 text-sm"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Promo code */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mt-4">
              <h2 className="text-sm font-bold text-primary mb-3">Promo Code</h2>
              <div className="relative">
                <IoPricetagOutline size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="input-field pl-9 text-sm"
                />
              </div>
              {promoCode && (
                <div className="flex items-center gap-1.5 mt-2">
                  <IoCheckmarkCircle size={14} className="text-primary" />
                  <span className="text-xs text-primary font-semibold">Code "{promoCode}" will be applied</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── Order summary ──────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-primary mb-3">Order Summary</h2>
            <div className="flex flex-col gap-2">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 text-gray-600 truncate">{item.product?.name}</span>
                  <span className="text-gray-400">×{item.quantity}</span>
                  <span className="font-semibold text-primary">₦{Number(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {items.length > 4 && (
                <p className="text-xs text-gray-400 italic">+{items.length - 4} more items</p>
              )}

              <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-primary">₦{Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Delivery</span>
                    {deliveryInfo.zone && (
                      <span className="text-[10px] text-gray-400">{deliveryInfo.zone}</span>
                    )}
                  </div>
                  {deliveryInfo.outsideKano ? (
                    <span className="text-xs font-bold text-red-500">Not available</span>
                  ) : (
                    <span className="font-semibold text-primary">₦{deliveryInfo.fee.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-gray-100">
                  <span className="font-bold text-primary">Total</span>
                  <span className="text-xl font-extrabold text-primary">₦{Number(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery zones info */}
          <div className="bg-primary-surface rounded-2xl p-4 border border-primary/10">
            <p className="text-xs font-bold text-primary mb-2">📍 Kano Delivery Zones</p>
            <div className="flex flex-col gap-1">
              {deliveryZones.map((zone) => (
                <div key={zone.id || zone.label} className="flex justify-between text-xs">
                  <span className="text-gray-600">{zone.label}</span>
                  <span className="font-semibold text-primary">₦{Number(zone.fee).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-primary mb-3">Payment Method</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary-surface">
              <IoCard size={22} className="text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-primary">Paystack</p>
                <p className="text-xs text-gray-400">Card, Bank Transfer, USSD</p>
              </div>
              <IoCheckmarkCircle size={18} className="text-primary" />
            </div>
          </div>

          <button
            form="checkout-form"
            type="submit"
            disabled={createOrderMutation.isPending || deliveryInfo.outsideKano}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrderMutation.isPending ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : deliveryInfo.outsideKano ? (
              'Delivery not available in your area'
            ) : (
              `Place Order · ₦${Number(total).toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
