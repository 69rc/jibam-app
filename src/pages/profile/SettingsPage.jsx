import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { IoArrowBack, IoPersonOutline, IoMailOutline, IoCallOutline, IoLockClosedOutline, IoLockOpenOutline, IoDownloadOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { isMobileDevice } from '../../utils/mobileDetection';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [useWebVersion, setUseWebVersion] = useState(localStorage.getItem('useWebVersion') === 'true');
  const isMobile = isMobileDevice();

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pErrs } } = useForm({
    defaultValues: { fullname: user?.fullname, phone: user?.phone || '' },
  });

  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrs } } = useForm();

  const onSaveProfile = async (data) => {
    setProfileSaving(true);
    try {
      const res = await authAPI.updateProfile(data);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setPwSaving(true);
    try {
      await authAPI.changePassword(data);
      toast.success('Password changed!');
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleToggleWebVersion = () => {
    const newValue = !useWebVersion;
    setUseWebVersion(newValue);
    localStorage.setItem('useWebVersion', newValue.toString());
    toast.success(newValue ? 'Web version enabled' : 'App download page enabled');
    // Reload to apply changes
    setTimeout(() => window.location.reload(), 1000);
  };

  const Field = ({ label, icon: Icon, error, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-primary">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-primary-surface transition">
          <IoArrowBack size={18} className="text-primary" />
        </button>
        <h1 className="text-2xl font-extrabold text-primary">Settings</h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* Edit Profile */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-primary mb-4">Edit Profile</h2>
          <form onSubmit={handleProfile(onSaveProfile)} className="flex flex-col gap-4">
            <Field label="Full Name" icon={IoPersonOutline} error={pErrs.fullname?.message}>
              <input
                {...regProfile('fullname', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
                className={`input-field pl-9 text-sm ${pErrs.fullname ? 'border-red-400 bg-red-50' : ''}`}
              />
            </Field>

            <Field label="Email Address" icon={IoMailOutline}>
              <input
                value={user?.email || ''}
                readOnly
                className="input-field pl-9 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </Field>

            <Field label="Phone Number" icon={IoCallOutline} error={pErrs.phone?.message}>
              <input
                {...regProfile('phone')}
                type="tel"
                placeholder="08012345678"
                className="input-field pl-9 text-sm"
              />
            </Field>

            <button
              type="submit"
              disabled={profileSaving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {profileSaving
                ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-primary mb-4">Change Password</h2>
          <form onSubmit={handlePw(onChangePassword)} className="flex flex-col gap-4">
            <Field label="Current Password" icon={IoLockClosedOutline} error={pwErrs.currentPassword?.message}>
              <input
                {...regPw('currentPassword', { required: 'Current password is required' })}
                type="password"
                className={`input-field pl-9 text-sm ${pwErrs.currentPassword ? 'border-red-400 bg-red-50' : ''}`}
              />
            </Field>

            <Field label="New Password" icon={IoLockOpenOutline} error={pwErrs.newPassword?.message}>
              <input
                {...regPw('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
                type="password"
                className={`input-field pl-9 text-sm ${pwErrs.newPassword ? 'border-red-400 bg-red-50' : ''}`}
              />
            </Field>

            <button
              type="submit"
              disabled={pwSaving}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              {pwSaving
                ? <span className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                : 'Change Password'}
            </button>
          </form>
        </div>

        {/* App/Web Version Toggle - Only show on mobile */}
        {isMobile && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-primary mb-4">App Preference</h2>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary">Use Web Version</span>
                <span className="text-xs text-gray-500">Continue using web instead of app</span>
              </div>
              <button
                onClick={handleToggleWebVersion}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${useWebVersion ? 'bg-[#8BC34A]' : 'bg-gray-300'}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${useWebVersion ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('useWebVersion');
                toast.success('Preference reset. Download page will show.');
                setTimeout(() => window.location.reload(), 1000);
              }}
              className="mt-4 text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              <IoDownloadOutline size={14} />
              Reset to show download page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
