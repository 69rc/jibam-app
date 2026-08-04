import { useState, useEffect } from 'react';
import { IoDownloadOutline, IoCloseOutline, IoStar, IoCheckmarkCircle } from 'react-icons/io5';
export default function PWAInstallPrompt({ forceShow = false, onDismiss }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [supportsInstall, setSupportsInstall] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);

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

    // Load dismissal count from localStorage
    const storedDismissCount = localStorage.getItem('pwaInstallDismissCount');
    if (storedDismissCount) {
      setDismissCount(parseInt(storedDismissCount));
    }

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
      // Clear dismissal count when installed
      localStorage.removeItem('pwaInstallDismissCount');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle forced show from parent component
  useEffect(() => {
    if (forceShow && deferredPrompt && !isInstalled) {
      setShowInstallPrompt(true);
    }
  }, [forceShow, deferredPrompt, isInstalled]);

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
    // Increment dismissal count and store it
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    localStorage.setItem('pwaInstallDismissCount', newCount.toString());
    
    // Only actually hide if dismissed multiple times (user really doesn't want it)
    if (newCount >= 5) {
      localStorage.setItem('pwaInstallDismissed', Date.now().toString());
    }
    
    if (onDismiss) onDismiss();
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoCloseOutline size={24} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
         <img src="/icons/logo.PNG" alt="Jibam Pharmacy" className="w-full h-full object-contain rounded-3xl" />
          </div>
          
          <h2 className="text-2xl font-black text-primary mb-2">Install Jibam Pharmacy</h2>
          <p className="text-gray-600 text-sm">
            Get the full pharmacy experience on your device
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <IoCheckmarkCircle className="text-green-600" size={16} />
            </div>
            <span className="text-sm text-gray-700">Faster loading times</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <IoCheckmarkCircle className="text-green-600" size={16} />
            </div>
            <span className="text-sm text-gray-700">Works offline</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <IoCheckmarkCircle className="text-green-600" size={16} />
            </div>
            <span className="text-sm text-gray-700">Easy access from home screen</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <IoCheckmarkCircle className="text-green-600" size={16} />
            </div>
            <span className="text-sm text-gray-700">Better mobile experience</span>
          </div>
        </div>
        
        <button
          onClick={handleInstallClick}
          className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#2E7D32] hover:to-[#1B5E20] text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
        >
          <IoDownloadOutline size={20} />
          Install App
        </button>
        
        <button
          onClick={handleDismiss}
          className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-3 transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}