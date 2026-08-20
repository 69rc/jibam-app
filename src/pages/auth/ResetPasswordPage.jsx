import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline,
  IoArrowBack, IoCheckmarkCircle,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import JibamLogo from '../../components/common/JibamLogo';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  // No token in URL — invalid link
  if (!token) {
    return (
      <div className="auth-shell">
        <div className="flex flex-col items-center justify-center flex-1 px-6 gap-4 text-center">
          <span className="text-5xl">🔗</span>
          <h2 className="text-xl font-extrabold text-primary">Invalid Reset Link</h2>
          <p className="text-sm text-gray-500">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn-primary px-8 mt-2">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async ({ password }) => {
    setLoading(true);
    setServerError('');
    try {
      await authAPI.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 400) {
        setServerError(msg || 'Reset link has expired. Please request a new one.');
      } else {
        setServerError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Header */}
      <div
        className="relative flex flex-col items-center justify-end pb-8 pt-14 px-6 overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 100%)', minHeight: 200 }}
      >
        <div className="absolute top-[-50px] right-[-50px] w-44 h-44 rounded-full bg-accent opacity-10" />
        <Link
          to="/login"
          className="absolute top-14 left-4 w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center z-10 active:bg-white/25 transition-colors"
        >
          <IoArrowBack size={18} className="text-white" />
        </Link>
        <JibamLogo size="md" light className="z-10 mb-2" />
        <h1 className="text-white text-xl font-extrabold z-10">Set New Password</h1>
        <p className="text-white/60 text-sm z-10 mt-0.5">Choose a strong new password</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 pb-8">
        <div
          className="bg-white rounded-3xl shadow-xl p-6 -mt-6 relative z-10"
          style={{ boxShadow: '0 8px 40px rgba(27,94,32,0.12)' }}
        >
          {done ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary-surface flex items-center justify-center">
                <IoCheckmarkCircle size={52} className="text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-primary">Password Reset!</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary px-10 mt-2"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm text-red-600 font-medium">{serverError}</p>
                    {serverError.includes('expired') && (
                      <Link to="/forgot-password" className="text-xs text-primary font-semibold underline">
                        Request a new link
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">New Password</label>
                <div className="relative">
                  <IoLockClosedOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'At least 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Must include uppercase, lowercase & number',
                      },
                    })}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`input-field pl-11 pr-12 ${errors.password ? 'border-red-400 bg-red-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary"
                  >
                    {showPass ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Confirm New Password</label>
                <div className="relative">
                  <IoLockClosedOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === password || 'Passwords do not match',
                    })}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`input-field pl-11 ${errors.confirmPassword ? 'border-red-400 bg-red-50' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1"
              >
                {loading
                  ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
