import Navbar from './Navbar';
import TopHeader from './TopHeader';
import Footer from './Footer';
import BottomNav from './BottomNav';
import WhatsAppButton from '../common/WhatsAppButton';
import PWAInstallPrompt from '../pwa/PWAInstallPrompt';
import PWAUpdateNotification from '../pwa/PWAUpdateNotification';

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="app-shell">
      {/* Mobile header — shown only on small screens */}
      <div className="sm:hidden">
        <TopHeader />
      </div>
      
      {/* Desktop navbar — shown only on larger screens */}
      <div className="hidden sm:block">
        <Navbar />
      </div>
      
      {/* Main content area */}
      <main className={`flex-1 pb-20 sm:pb-0 ${fullWidth ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6'}`}>
        {children}
      </main>
      
      {/* Desktop footer — shown only on larger screens */}
      <div className="hidden sm:block">
        <Footer />
      </div>
      
      {/* Mobile bottom nav — only shown on small screens */}
      <BottomNav />
      
      {/* WhatsApp floating button */}
      <WhatsAppButton />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* PWA Update Notification */}
      <PWAUpdateNotification />
    </div>
  );
}
