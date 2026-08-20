import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  IoMailOutline, IoLockClosedOutline,
  IoEyeOutline, IoEyeOffOutline, IoArrowBack,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import JibamLogo from '../../components/common/JibamLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await authAPI.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth({ user, accessToken, refreshToken });
      toast.success(`Welcome back, ${user.fullname.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 401) {
        if (msg?.toLowerCase().includes('password')) {
          setServerError('Incorrect password. Please try again.');
        } else if (msg?.toLowerCase().includes('email') || msg?.toLowerCase().includes('account')) {
          setServerError('No account found with this email address.');
        } else {
          setServerError('Invalid email or password.');
        }
      } else if (status === 403) {
        setServerError('Your account has been deactivated. Contact support.');
      } else if (!err.response) {
        setServerError('Network error. Check your connection and try again.');
      } else {
        setServerError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Branded header ─────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-end pb-8 pt-16 px-6 overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 100%)', minHeight: 220 }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-60px] w-52 h-52 rounded-full bg-accent opacity-10" />
        <div className="absolute top-[-30px] left-[-50px] w-40 h-40 rounded-full bg-primary-light opacity-30" />
        <div className="absolute bottom-[-50px] right-[-20px] w-32 h-32 rounded-full bg-accent opacity-8" />

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-14 left-4 w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center z-10 active:bg-white/25 transition-colors"
          aria-label="Go back"
        >
          <IoArrowBack size={18} className="text-white" />
        </button>

        <JibamLogo size="lg" light className="z-10 mb-3" />
        <p className="text-white/60 text-sm tracking-wide z-10">Sign in to your account</p>
      </div>

      {/* ── Form card ──────────────────────────────── */}
      <div className="flex-1 px-4 pb-8">
        <div
          className="bg-white rounded-3xl shadow-xl p-6 -mt-6 relative z-10"
          style={{ boxShadow: '0 8px 40px rgba(27,94,32,0.12)' }}
        >
          <h1 className="text-2xl font-extrabold text-primary mb-1">Welcome Back 👋</h1>
          <p className="text-sm text-gray-400 mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Server error banner */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-sm text-red-600 font-medium">{serverError}</p>
              </div>
            )}
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-semibold text-primary">
                Email Address
              </label>
              <div className="relative">
                <IoMailOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                <input
                  id="login-email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                  })}
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field pl-11 ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-semibold text-primary">Password</label>
              <div className="relative">
                <IoLockClosedOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                <input
                  id="login-password"
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field pl-11 pr-12 ${errors.password ? 'border-red-400 bg-red-50' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                >
                  {showPass ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-sm text-primary font-semibold">
                Forgot Password?
              </Link>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <Link
              id="go-to-register"
              to="/register"
              className="btn-outline w-full text-center"
            >
              Create New Account
            </Link>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Jibam Pharmacy · RC: 1948976
        </p>
      </div>
    </div>
  );
}
