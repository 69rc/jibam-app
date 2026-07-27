import { useState, useEffect } from 'react';
import { IoDownloadOutline, IoCloseOutline } from 'react-icons/io5';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [supportsInstall, setSupportsInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isInStandaloneMode = () =>
        (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator.standalone) ||
        document.referrer.includes('android-app://');
      
      if (isInStandaloneMode()) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Check if browser supports PWA install
    const checkSupport = () => {
      setSupportsInstall('beforeinstallprompt' in window);
    };

    checkSupport();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] Install prompt event received');
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom install prompt
      setShowInstallPrompt(true);
    };

    // Listen for app install completion
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for some time
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  };

  // Check if user recently dismissed the prompt
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwaInstallDismissed');
    if (dismissedTime) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) { // Don't show if dismissed within 7 days
        setShowInstallPrompt(false);
      }
    }
  }, []);

  // Don't show if already installed or no prompt available
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    // Debug: Show test button during development
    if (process.env.NODE_ENV === 'development' && supportsInstall) {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              console.log('[PWA] Debug: Simulating install prompt');
              setShowInstallPrompt(true);
            }}
            className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
          >
            Test Install Prompt
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 sm:bottom-8 sm:left-auto sm:right-8 sm:w-96">
      <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0D1B5E] to-[#1A2E8A] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="24" height="28" viewBox="0 0 100 115" fill="none">
              <path d="M50 5 L92 22 L92 58 Q92 90 50 110 Q8 90 8 58 L8 22 Z" stroke="white" strokeWidth="6" fill="none"/>
              <line x1="50" y1="28" x2="50" y2="88" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              <line x1="32" y1="40" x2="68" y2="40" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="36" y1="54" x2="64" y2="54" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="50" cy="26" r="5" fill="#00AEEF"/>
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-navy text-sm mb-1">Install Jibam Pharmacy</h3>
            <p className="text-xs text-gray-500 mb-3">
              Get the full experience with faster loading and offline access
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-[#0D1B5E] hover:bg-[#1A2E8A] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <IoDownloadOutline size={14} />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
              >
                <IoCloseOutline size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}