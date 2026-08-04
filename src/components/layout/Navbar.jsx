import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  IoSearchOutline, IoCartOutline, IoPersonOutline,
  IoHeartOutline, IoReceiptOutline, IoLogOutOutline,
  IoMenuOutline, IoCloseOutline, IoNotificationsOutline,
} from 'react-icons/io5';
import JibamLogo from '../common/JibamLogo';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { authAPI } from '../../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const resetCart = useCartStore((s) => s.resetCart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    logout();
    resetCart();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Browse' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <JibamLogo size="sm" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === l.to ? 'text-accent' : 'text-gray-600 hover:text-primary'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link to="/search" className="p-2 hover:bg-primary-surface rounded-xl transition" aria-label="Search">
              <IoSearchOutline size={22} className="text-primary" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-primary-surface rounded-xl transition" aria-label="Cart">
              <IoCartOutline size={22} className="text-primary" />
              {isAuthenticated && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary-surface transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.fullname?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-primary">
                    {user?.fullname?.split(' ')[0]}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-primary">{user?.fullname}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      {[
                        { to: '/orders', label: 'My Orders', Icon: IoReceiptOutline },
                        { to: '/wishlist', label: 'Wishlist', Icon: IoHeartOutline },
                        { to: '/profile', label: 'Profile', Icon: IoPersonOutline },
                        { to: '/notifications', label: 'Notifications', Icon: IoNotificationsOutline },
                      ].map(({ to, label, Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-surface transition text-sm text-gray-700 font-medium"
                        >
                          <Icon size={17} className="text-primary" />
                          {label}
                        </Link>
                      ))}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-sm text-red-600 font-medium w-full"
                      >
                        <IoLogOutOutline size={17} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-light transition px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 rounded-xl">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-primary-surface rounded-xl"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <IoCloseOutline size={22} className="text-primary" /> : <IoMenuOutline size={22} className="text-primary" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-semibold text-gray-700 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm font-semibold text-primary">Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm text-center">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
