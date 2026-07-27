import { Link, useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoNotificationsOutline,
  IoCartOutline,
} from 'react-icons/io5';
import JibamLogo from '../common/JibamLogo';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

export default function TopHeader() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <header className="app-header">
      {/* Logo */}
      <Link to="/" aria-label="Jibam Pharmacy Home" className="flex-shrink-0">
        <JibamLogo size="sm" />
      </Link>

      {/* Right icon row */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          id="header-search-btn"
          onClick={() => navigate('/search')}
          className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-navy-surface active:bg-navy-surface transition-colors"
          aria-label="Search"
        >
          <IoSearchOutline size={22} className="text-navy" />
        </button>

        {/* Cart (with badge) */}
        <Link
          id="header-cart-btn"
          to="/cart"
          className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-navy-surface active:bg-navy-surface transition-colors"
          aria-label="Cart"
        >
          <IoCartOutline size={22} className="text-navy" />
          {isAuthenticated && itemCount > 0 && (
            <span className="absolute top-1 right-1 bg-cyan text-white text-[9px] font-black min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        {isAuthenticated && (
          <Link
            id="header-notif-btn"
            to="/notifications"
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-navy-surface active:bg-navy-surface transition-colors"
            aria-label="Notifications"
          >
            <IoNotificationsOutline size={22} className="text-navy" />
          </Link>
        )}
      </div>
    </header>
  );
}
