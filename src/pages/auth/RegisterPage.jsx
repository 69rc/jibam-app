import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  IoPersonOutline, IoMailOutline, IoCallOutline,
  IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoArrowBack,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import JibamLogo from '../../components/common/JibamLogo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth({ user, accessToken, refreshToken });
      toast.success(`Account created! Welcome, ${user.fullname.split(' ')[0]} 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Branded header ─────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-end pb-8 pt-14 px-6 overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #0D1B5E 0%, #1A2E8A 100%)', minHeight: 200 }}
      >
        <div className="absolute top-[-60px] right-[-50px] w-44 h-44 rounded-full bg-cyan opacity-10" />
        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 rounded-full bg-navy-light opacity-30" />

        {/* Back button */}
        <Link
          to="/login"
          className="absolute top-14 left-4 w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center z-10 active:bg-white/25 transition-colors"
          aria-label="Back to login"
        >
          <IoArrowBack size={18} className="text-white" />
        </Link>

        <JibamLogo size="md" light className="z-10 mb-2" />
        <h1 className="text-white text-xl font-extrabold z-10">Create Account</h1>
        <p className="text-white/60 text-sm z-10 mt-0.5">Join thousands of customers across Nigeria</p>
      </div>

      {/* ── Form card ──────────────────────────────── */}
      <div className="flex-1 px-4 pb-8">
        <div
          className="bg-white rounded-3xl shadow-xl p-6 -mt-6 relative z-10"
          style={{ boxShadow: '0 8px 40px rgba(13,27,94,0.12)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-fullname" className="text-sm font-semibold text-navy">Full Name</label>
              <div className="relative">
                <IoPersonOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan pointer-events-none" />
                <input
                  id="reg-fullname"
                  {...register('fullname', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name is too short' },
                  })}
                  placeholder="John Doe"
                  autoComplete="name"
                  className={`input-field pl-11 ${errors.fullname ? 'border-red-400 bg-red-50' : ''}`}
                />
              </div>
              {errors.fullname && <p className="text-xs text-red-500">{errors.fullname.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-sm font-semibold text-navy">Email Address</label>
              <div className="relative">
                <IoMailOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan pointer-events-none" />
                <input
                  id="reg-email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className={`input-field pl-11 ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-phone" className="text-sm font-semibold text-navy">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <IoCallOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan pointer-events-none" />
                <input
                  id="reg-phone"
                  {...register('phone', {
                    pattern: { value: /^(\+?234|0)[789]\d{9}$/, message: 'Invalid Nigerian phone number' },
                  })}
                  type="tel"
                  placeholder="08012345678"
                  autoComplete="tel"
                  inputMode="tel"
                  className={`input-field pl-11 ${errors.phone ? 'border-red-400 bg-red-50' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold text-navy">Password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan pointer-events-none" />
                <input
                  id="reg-password"
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
                  id="reg-toggle-password"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-navy transition-colors"
                >
                  {showPass ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-confirm-password" className="text-sm font-semibold text-navy">Confirm Password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan pointer-events-none" />
                <input
                  id="reg-confirm-password"
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
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading
                ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan font-bold">Sign In</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Jibam Pharmacy · RC: 1948976
        </p>
      </div>
    </div>
  );
}
