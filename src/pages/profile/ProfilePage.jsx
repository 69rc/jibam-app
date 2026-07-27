import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoPersonOutline, IoLocationOutline, IoHeartOutline,
  IoNotificationsOutline, IoSettingsOutline, IoLogOutOutline,
  IoChevronForward,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import JibamLogo from '../../components/common/JibamLogo';

const MENU_ITEMS = [
  { icon: IoSettingsOutline, label: 'Edit Profile', to: '/settings', color: '#0D1B5E' },
  { icon: IoLocationOutline, label: 'My Addresses', to: '/addresses', color: '#0D1B5E' },
  { icon: IoHeartOutline, label: 'Wishlist', to: '/wishlist', color: '#E53935' },
  { icon: IoNotificationsOutline, label: 'Notifications', to: '/notifications', color: '#00AEEF' },
  { icon: IoPersonOutline, label: 'Account Settings', to: '/settings', color: '#0D1B5E' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const resetCart = useCartStore((s) => s.resetCart);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSettled: () => {
      logout();
      resetCart();
      queryClient.clear();
      navigate('/');
    },
  });

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) logoutMutation.mutate();
  };

  return (
    <div>
      {/* Navy header */}
      <div className="bg-navy rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-cyan opacity-10" />
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-navy-light opacity-40" />

        <JibamLogo size="xs" light className="mb-4 z-10 relative" />

        <div className="flex items-center gap-4 z-10 relative">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-cyan flex items-center justify-center border-2 border-white/30 flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-extrabold">
                {user?.fullname?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-lg leading-tight truncate">{user?.fullname}</p>
            <p className="text-white/70 text-sm truncate">{user?.email}</p>
            {user?.phone && <p className="text-white/50 text-xs">{user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {MENU_ITEMS.map(({ icon: Icon, label, to, color }, i) => (
          <Link
            key={to + label}
            to={to}
            className={`flex items-center gap-3 px-4 py-4 hover:bg-navy-surface transition
              ${i < MENU_ITEMS.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color + '18' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-700">{label}</span>
            <IoChevronForward size={15} className="text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-4 w-full hover:bg-red-50 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <IoLogOutOutline size={18} className="text-red-500" />
          </div>
          <span className="flex-1 text-sm font-semibold text-red-500 text-left">Logout</span>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">Jibam Pharmacy · RC: 1948976 · v1.0.0</p>
    </div>
  );
}
