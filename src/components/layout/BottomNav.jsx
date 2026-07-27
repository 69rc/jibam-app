/**
 * Mobile bottom navigation bar — shown only on small screens
 */
import { Link, useLocation } from 'react-router-dom';
import {
  IoHomeOutline, IoHome,
  IoSearchOutline, IoSearch,
  IoCartOutline, IoCart,
  IoReceiptOutline, IoReceipt,
  IoPersonOutline, IoPerson,
} from 'react-icons/io5';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const NAV_ITEMS = [
  { to: '/',        label: 'Home',    Icon: IoHomeOutline,    IconActive: IoHome       },
  { to: '/search',  label: 'Browse',  Icon: IoSearchOutline,  IconActive: IoSearch     },
  { to: '/cart',    label: 'Cart',    Icon: IoCartOutline,    IconActive: IoCart,    badge: true },
  { to: '/orders',  label: 'Orders',  Icon: IoReceiptOutline, IconActive: IoReceipt    },
  { to: '/profile', label: 'Profile', Icon: IoPersonOutline,  IconActive: IoPerson     },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <nav className="app-bottom-nav sm:hidden">
      {NAV_ITEMS.map(({ to, label, Icon, IconActive, badge }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
        const ActiveIcon = isActive ? IconActive : Icon;
        return (
          <Link
            key={to}
            to={to}
            className={`bottom-nav-tab ${isActive ? 'bottom-nav-tab--active' : ''}`}
          >
            <div className="relative">
              <ActiveIcon size={24} />
              {badge && isAuthenticated && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cyan text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className="bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
