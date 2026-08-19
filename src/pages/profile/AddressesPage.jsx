import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { IoArrowBack, IoAdd, IoPencilOutline, IoTrashOutline, IoLocationOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import api, { addressAPI } from '../../services/api';
import { DEFAULT_DELIVERY_ZONES } from '../../constants';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

export default function AddressesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  // ── Fetch live delivery zones from API ────────────────────────────────────
  const { data: deliveryZones = DEFAULT_DELIVERY_ZONES } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => api.get('/settings/delivery-zones').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.getAll().then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editTarget ? addressAPI.update(editTarget.id, data) : addressAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      setModalOpen(false);
      setEditTarget(null);
      reset();
      toast.success(editTarget ? 'Address updated' : 'Address added');
    },
    onError: () => toast.error('Failed to save address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => addressAPI.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['addresses']); toast.success('Address deleted'); },
  });

  const handleEdit = (addr) => {
    setEditTarget(addr);
    reset(addr);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditTarget(null);
    reset({ state: 'Kano' }); // pre-fill state
    setModalOpen(true);
  };

  const handleDelete = (addr) => {
    if (window.confirm(`Delete "${addr.label || addr.street}" address?`)) deleteMutation.mutate(addr.id);
  };

  // Watch selected zone to show delivery fee preview
  const selectedCity = watch('city');
  const selectedZone = deliveryZones.find((z) =>
    z.label === selectedCity ||
    (z.areas || []).some((a) => a.toLowerCase() === (selectedCity || '').toLowerCase())
  );

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-primary-surface transition">
            <IoArrowBack size={18} className="text-primary" />
          </button>
          <h1 className="text-2xl font-extrabold text-primary">My Addresses</h1>
        </div>
        <button onClick={handleNew} className="w-9 h-9 rounded-xl bg-primary-surface flex items-center justify-center hover:bg-primary/10 transition">
          <IoAdd size={22} className="text-primary" />
        </button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          icon={IoLocationOutline}
          title="No addresses saved"
          subtitle="Add a delivery address to speed up checkout"
          actionLabel="Add Address"
          onAction={handleNew}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => {
            // Find the delivery fee for this address
            const zone = deliveryZones.find((z) =>
              z.label === addr.city ||
              (z.areas || []).some((a) => a.toLowerCase() === (addr.city || '').toLowerCase())
            );
            return (
              <div key={addr.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <IoLocationOutline size={15} className="text-primary" />
                    <span className="text-sm font-bold text-primary">{addr.label}</span>
                    {addr.isDefault && <span className="badge-navy text-[10px]">Default</span>}
                    {zone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-surface text-primary">
                        ₦{Number(zone.fee).toLocaleString()} delivery
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(addr)} className="w-8 h-8 rounded-lg bg-primary-surface flex items-center justify-center hover:bg-primary/10 transition">
                      <IoPencilOutline size={14} className="text-primary" />
                    </button>
                    <button onClick={() => handleDelete(addr)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition">
                      <IoTrashOutline size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700">{addr.fullname}</p>
                <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state}</p>
                <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset({}); }}
        title={editTarget ? 'Edit Address' : 'Add Address'}
        footer={
          <button
            type="submit"
            form="address-form"
            disabled={saveMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saveMutation.isPending
              ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : editTarget ? 'Save Changes' : 'Add Address'}
          </button>
        }
      >
        <form
          id="address-form"
          onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
          className="flex flex-col gap-4"
        >
          {/* Label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary">Address Label (e.g. Home, Office)</label>
            <input
              {...register('label', { required: 'Required' })}
              placeholder="Home"
              className={`input-field text-sm ${errors.label ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.label && <p className="text-xs text-red-500">{errors.label.message}</p>}
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary">Full Name</label>
            <input
              {...register('fullname', { required: 'Required' })}
              placeholder="John Doe"
              className={`input-field text-sm ${errors.fullname ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.fullname && <p className="text-xs text-red-500">{errors.fullname.message}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary">Phone</label>
            <input
              {...register('phone', { required: 'Required' })}
              placeholder="08012345678"
              type="tel"
              inputMode="tel"
              className={`input-field text-sm ${errors.phone ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Street */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary">Street Address</label>
            <input
              {...register('street', { required: 'Required' })}
              placeholder="12 Kano Road"
              className={`input-field text-sm ${errors.street ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
          </div>

          {/* Delivery Zone — replaces free-text city field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary">Delivery Zone / Area</label>
            <select
              {...register('city', { required: 'Select your delivery zone' })}
              className={`input-field text-sm ${errors.city ? 'border-red-400 bg-red-50' : ''}`}
            >
              <option value="">— Select zone —</option>
              {deliveryZones.map((zone) => (
                <option key={zone.id || zone.label} value={zone.label}>
                  {zone.label} — ₦{Number(zone.fee).toLocaleString()}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            {/* Live delivery fee preview */}
            {selectedZone && (
              <p className="text-xs text-primary font-semibold mt-0.5">
                📦 Delivery fee: ₦{Number(selectedZone.fee).toLocaleString()}
              </p>
            )}
          </div>

          {/* State — fixed to Kano */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary">State</label>
            <input
              {...register('state', { required: 'Required' })}
              defaultValue="Kano"
              readOnly
              className="input-field text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400">We currently deliver within Kano state only</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
