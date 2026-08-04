import { Link } from 'react-router-dom';
import JibamLogo from '../common/JibamLogo';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <JibamLogo size="md" light className="mb-4" />
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Your trusted online pharmacy for quality medicines, vitamins, and healthcare products. Delivered fast across Nigeria.
            </p>
            <p className="text-xs text-white/50 mt-4">RC: 1948976</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                { to: '/', label: 'Home' },
                { to: '/search', label: 'Browse Medicines' },
                { to: '/cart', label: 'My Cart' },
                { to: '/orders', label: 'My Orders' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold text-sm mb-3 text-accent">Account</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
                { to: '/profile', label: 'My Profile' },
                { to: '/wishlist', label: 'Wishlist' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Jibam Pharmacy · RC: 1948976</p>
          <p className="text-xs text-white/50">Built for better healthcare access across Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}
