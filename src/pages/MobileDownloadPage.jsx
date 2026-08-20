/**
 * MobileDownloadPage
 *
 * Shown to first-time mobile visitors who haven't installed the PWA yet.
 * Guides them to install via "Add to Home Screen" (iOS) or the browser
 * install prompt (Android/Chrome).
 *
 * "Continue to Web" bypasses this and opens the full web app.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoDownloadOutline, IoStarOutline, IoShieldCheckmarkOutline,
  IoTimeOutline, IoHeartOutline, IoLaptopOutline, IoMedkitOutline,
  IoShareOutline, IoAddCircleOutline, IoPhonePortraitOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { isIOS, isAndroid } from '../utils/mobileDetection';

export default function MobileDownloadPage() {
  const navigate = useNavigate();
  const ios = isIOS();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Capture Android/Chrome native install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome: show native install dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => {
          localStorage.setItem('useWebVersion', 'true');
          navigate('/');
        }, 1500);
      }
      setDeferredPrompt(null);
    }
  };

  const handleContinueToWeb = () => {
    localStorage.setItem('useWebVersion', 'true');
    navigate('/');
  };

  const features = [
    { icon: <IoMedkitOutline size={22} />, title: 'Wide Range', description: 'Thousands of medicines' },
    { icon: <IoTimeOutline size={22} />, title: 'Fast Delivery', description: 'Delivered to your door' },
    { icon: <IoShieldCheckmarkOutline size={22} />, title: 'Secure Pay', description: 'Safe payments' },
    { icon: <IoHeartOutline size={22} />, title: 'Wishlist', description: 'Save & reorder easily' },
  ];

  if (installed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1B5E20] to-[#2E7D32] flex flex-col items-center justify-center gap-5 p-6 text-center">
        <IoCheckmarkCircle size={80} className="text-white" />
        <h2 className="text-2xl font-extrabold text-white">App Installed!</h2>
        <p className="text-white/80 text-sm">Open Jibam Pharmacy from your home screen</p>
        <button onClick={() => navigate('/')} className="bg-white text-primary font-bold px-8 py-3 rounded-2xl mt-2">
          Open App
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B5E20] to-[#2E7D32] flex flex-col items-center justify-start p-6 overflow-y-auto pb-10">

      {/* Logo */}
      <div className="text-center mt-8 mb-6">
        <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl p-2">
          <img src="/icons/logo.PNG" alt="Jibam Pharmacy" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">
          Jibam <span className="text-[#8BC34A]">Pharmacy</span>
        </h1>
        <p className="text-white/70 text-sm">Your trusted online pharmacy</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-sm">
        {features.map((f, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-[#8BC34A] mb-1 flex justify-center">{f.icon}</div>
            <p className="text-white font-semibold text-xs">{f.title}</p>
            <p className="text-white/60 text-[10px] mt-0.5">{f.description}</p>
          </div>
        ))}
      </div>

      {/* ── iOS: Add to Home Screen instructions ── */}
      {ios && (
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
          <h2 className="text-white font-bold text-base mb-4 text-center">
            📲 Install on iPhone / iPad
          </h2>
          <div className="flex flex-col gap-3">
            <IOSStep icon={<IoShareOutline size={18} />} n={1}>
              Tap the <strong>Share</strong> button at the bottom of Safari
            </IOSStep>
            <IOSStep icon={<IoAddCircleOutline size={18} />} n={2}>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </IOSStep>
            <IOSStep icon={<IoPhonePortraitOutline size={18} />} n={3}>
              Tap <strong>"Add"</strong> — the app icon appears on your home screen
            </IOSStep>
          </div>
        </div>
      )}

      {/* ── Android: Native install button or instructions ── */}
      {!ios && (
        deferredPrompt ? (
          /* Browser supports native prompt — show install button */
          <button
            onClick={handleInstall}
            className="w-full max-w-sm bg-[#8BC34A] text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 mb-3 active:scale-95 transition-transform"
          >
            <IoDownloadOutline size={22} />
            Install App (Free)
          </button>
        ) : (
          /* Browser doesn't support prompt (Firefox, Samsung Browser) — show manual steps */
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
            <h2 className="text-white font-bold text-base mb-4 text-center">
              📲 Install on Android
            </h2>
            <div className="flex flex-col gap-3">
              <IOSStep icon={<span className="text-sm">⋮</span>} n={1}>
                Tap the <strong>3-dot menu</strong> in your browser
              </IOSStep>
              <IOSStep icon={<IoAddCircleOutline size={18} />} n={2}>
                Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>
              </IOSStep>
              <IOSStep icon={<IoPhonePortraitOutline size={18} />} n={3}>
                Tap <strong>"Add"</strong> — done!
              </IOSStep>
            </div>
          </div>
        )
      )}

      {/* Continue to web */}
      <button
        onClick={handleContinueToWeb}
        className="w-full max-w-sm bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <IoLaptopOutline size={18} />
        Continue to Web Version
      </button>

      {/* Stars */}
      <div className="mt-6 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <IoStarOutline key={i} size={18} className="text-yellow-400" />
        ))}
        <span className="text-white/70 text-xs ml-2">4.8 · Free</span>
      </div>

      <p className="text-white/40 text-xs mt-4">RC: 1948976 · © {new Date().getFullYear()} Jibam Pharmacy</p>
    </div>
  );
}

function IOSStep({ n, icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-[#8BC34A] flex-shrink-0 text-sm">{icon}</span>
        <p className="text-white/85 text-sm">{children}</p>
      </div>
    </div>
  );
}
