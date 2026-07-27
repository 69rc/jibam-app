import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { IoArrowBack, IoAdd, IoPencilOutline, IoTrashOutline, IoLocationOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { addressAPI } from '../../services/api';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const FIELDS = [
  { name: 'fullname', label: 'Full Name', icon: 'person', rules: { required: 'Required' } },
  { name: 'phone', label: 'Phone', icon: 'call', rules: { required: 'Required' } },
  { name: 'street', label: 'Street Address', icon: 'location', rules: { required: 'Required' } },
  { name: 'city', label: 'City', icon: 'business', rules: { required: 'Required' } },
  { name: 'state', label: 'State', icon: 'map', rules: { required: 'Required' } },
];

export default function AddressesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
    reset({});
    setModalOpen(true);
  };

  const handleDelete = (addr) => {
    if (window.confirm(`Delete "${addr.label || addr.street}" address?`)) deleteMutation.mutate(addr.id);
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-navy-surface transition">
            <IoArrowBack size={18} className="text-navy" />
          </button>
          <h1 className="text-2xl font-extrabold text-navy">My Addresses</h1>
        </div>
        <button onClick={handleNew} className="w-9 h-9 rounded-xl bg-navy-surface flex items-center justify-center hover:bg-navy/10 transition">
          <IoAdd size={22} className="text-navy" />
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
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <IoLocationOutline size={15} className="text-navy" />
                  <span className="text-sm font-bold text-navy">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="badge-navy text-[10px]">Default</span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(addr)} className="w-8 h-8 rounded-lg bg-navy-surface flex items-center justify-center hover:bg-navy/10 transition">
                    <IoPencilOutline size={14} className="text-navy" />
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
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset({}); }}
        title={editTarget ? 'Edit Address' : 'Add Address'}
      >
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="flex flex-col gap-4">
          {FIELDS.map(({ name, label, rules }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-navy">{label}</label>
              <input
                {...register(name, rules)}
                className={`input-field text-sm ${errors[name] ? 'border-red-400 bg-red-50' : ''}`}
              />
              {errors[name] && <p className="text-xs text-red-500">{errors[name].message}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {saveMutation.isPending
              ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : editTarget ? 'Save Changes' : 'Add Address'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
