import { useState, useEffect } from 'react';
import {
  IoDownloadOutline, IoCloseOutline, IoCheckmarkCircle,
  IoShareOutline, IoAddCircleOutline, IoPhonePortraitOutline,
} from 'react-icons/io5';

// Detect iOS (Safari doesn't fire beforeinstallprompt)
const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;

// Detect if running as installed PWA (standalone mode)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null); // Android/Chrome
  const [showPrompt, setShowPrompt] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    // Already installed — never show
    if (isStandalone()) return;

    // Already permanently dismissed
    const dismissed = localStorage.getItem('pwaPromptDismissed');
    if (dismissed) return;

    if (isIOS()) {
      // iOS: show manual instructions after a short delay
      setIosMode(true);
      const t = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(t);
    }

    // Android/Chrome: wait for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const onInstalled = () => {
      setShowPrompt(false);
      localStorage.removeItem('pwaPromptDismissed');
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = (permanent = false) => {
    setShowPrompt(false);
    if (permanent) localStorage.setItem('pwaPromptDismissed', '1');
  };

  if (!showPrompt) return null;

  // ── iOS: manual Add to Home Screen instructions ────────────────────────────
  if (iosMode) {
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-0">
        <div className="absolute inset-0 bg-black/50" onClick={() => handleDismiss(false)} />
        <div className="relative bg-white w-full max-w-md rounded-t-3xl shadow-2xl p-6 pb-8 animate-slideUp">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

          <button
            onClick={() => handleDismiss(true)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <IoCloseOutline size={24} />
          </button>

          {/* Logo + title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
              <img src="/icons/logo.PNG" alt="Jibam Pharmacy" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-primary leading-tight">Add to Home Screen</h2>
              <p className="text-xs text-gray-500">Install Jibam Pharmacy on your iPhone</p>
            </div>
          </div>

          {/* Step-by-step iOS instructions */}
          <div className="flex flex-col gap-3 mb-6">
            <Step n={1} icon={<IoShareOutline size={20} className="text-blue-500" />}>
              Tap the <strong>Share</strong> button at the bottom of Safari
            </Step>
            <Step n={2} icon={<IoAddCircleOutline size={20} className="text-primary" />}>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </Step>
            <Step n={3} icon={<IoPhonePortraitOutline size={20} className="text-primary" />}>
              Tap <strong>"Add"</strong> — the app icon will appear on your home screen
            </Step>
          </div>

          {/* Visual hint arrow pointing down toward Safari toolbar */}
          <div className="bg-primary-surface rounded-2xl p-3 flex items-center gap-3 mb-4">
            <IoShareOutline size={22} className="text-primary flex-shrink-0" />
            <p className="text-xs text-primary font-semibold">
              Look for the Share icon (box with arrow) in your Safari toolbar
            </p>
          </div>

          <button
            onClick={() => handleDismiss(true)}
            className="w-full text-gray-400 text-sm py-2"
          >
            Don't show again
          </button>
        </div>
      </div>
    );
  }

  // ── Android/Chrome: native install prompt ──────────────────────────────────
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-bounce-in">
        <button
          onClick={() => handleDismiss(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IoCloseOutline size={24} />
        </button>

        <div className="text-center mb-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mx-auto mb-3">
            <img src="/icons/logo.PNG" alt="Jibam Pharmacy" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-black text-primary mb-1">Install Jibam Pharmacy</h2>
          <p className="text-gray-500 text-sm">Get the full app experience on your device</p>
        </div>

        <div className="space-y-2.5 mb-5">
          {[
            'Faster loading times',
            'Works offline',
            'Easy access from home screen',
            'Push notifications for orders',
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary-surface rounded-full flex items-center justify-center flex-shrink-0">
                <IoCheckmarkCircle className="text-primary" size={15} />
              </div>
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleInstall}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-2"
        >
          <IoDownloadOutline size={20} />
          Install App
        </button>

        <button
          onClick={() => handleDismiss(false)}
          className="w-full text-gray-400 hover:text-gray-600 text-sm py-2"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

function Step({ n, icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-center gap-2 flex-1">
        {icon}
        <p className="text-sm text-gray-700">{children}</p>
      </div>
    </div>
  );
}
