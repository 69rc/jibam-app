import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IoMailOutline, IoMailOpenOutline, IoArrowBack } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import JibamLogo from '../../components/common/JibamLogo';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
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
        <div className="absolute top-[-50px] right-[-50px] w-44 h-44 rounded-full bg-cyan opacity-10" />

        <Link
          to="/login"
          className="absolute top-14 left-4 w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center z-10 active:bg-white/25 transition-colors"
          aria-label="Back to login"
        >
          <IoArrowBack size={18} className="text-white" />
        </Link>

        <JibamLogo size="md" light className="z-10 mb-2" />
        <h1 className="text-white text-xl font-extrabold z-10">Reset Password</h1>
        <p className="text-white/60 text-sm z-10 mt-0.5">We'll send you a reset link by email</p>
      </div>

      {/* ── Card ───────────────────────────────────── */}
      <div className="flex-1 px-4 pb-8">
        <div
          className="bg-white rounded-3xl shadow-xl p-6 -mt-6 relative z-10"
          style={{ boxShadow: '0 8px 40px rgba(13,27,94,0.12)' }}
        >
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-24 h-24 rounded-full bg-cyan-surface flex items-center justify-center border-2 border-cyan/30">
                <IoMailOpenOutline size={48} className="text-cyan" />
              </div>
              <h2 className="text-xl font-extrabold text-navy">Check Your Email</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                If your email is registered, a password reset link has been sent.
                Check your inbox and spam folder.
              </p>
              <Link id="back-to-login-btn" to="/login" className="btn-primary mt-2 px-10">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="forgot-email" className="text-sm font-semibold text-navy">
                  Email Address
                </label>
                <div className="relative">
                  <IoMailOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan pointer-events-none" />
                  <input
                    id="forgot-email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                    })}
                    type="email"
                    placeholder="you@example.com"
                    inputMode="email"
                    autoComplete="email"
                    className={`input-field pl-11 ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <button
                id="send-reset-link-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading
                  ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Send Reset Link'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-cyan font-semibold"
              >
                <IoArrowBack size={14} /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
