import { useNavigate } from 'react-router-dom';
import {
  IoDownloadOutline, IoStarOutline, IoShieldCheckmarkOutline,
  IoTimeOutline, IoHeartOutline, IoLaptopOutline, IoMedkitOutline,
  IoShareOutline, IoAddCircleOutline, IoPhonePortraitOutline,
} from 'react-icons/io5';
import { isIOS, isAndroid } from '../utils/mobileDetection';

export default function MobileDownloadPage() {
  const navigate = useNavigate();
  const ios = isIOS();
  const android = isAndroid();

  const handleAndroidDownload = () => {
    const apkUrl = 'https://your-domain.com/jibam-pharmacy.apk';
    window.location.href = apkUrl;
  };

  const handleContinueToWeb = () => {
    localStorage.setItem('useWebVersion', 'true');
    navigate('/');
  };

  const features = [
    { icon: <IoMedkitOutline size={24} />, title: 'Wide Range of Medicines', description: 'Access thousands of pharmaceutical products' },
    { icon: <IoTimeOutline size={24} />, title: 'Fast Delivery', description: 'Get your medicines delivered quickly to your doorstep' },
    { icon: <IoShieldCheckmarkOutline size={24} />, title: 'Secure Payments', description: 'Safe and secure payment options' },
    { icon: <IoHeartOutline size={24} />, title: 'Wishlist & Reorder', description: 'Save favourites and easily reorder' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B5E20] to-[#2E7D32] flex flex-col items-center justify-center p-6 overflow-y-auto">

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-28 h-28 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl p-2">
          <img src="/icons/logo.PNG" alt="Jibam Pharmacy" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Jibam <span className="text-[#8BC34A]">Pharmacy</span>
        </h1>
        <p className="text-white/80 text-sm">Your trusted online pharmacy</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
        {features.map((f, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-[#8BC34A] mb-2 flex justify-center">{f.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-white/70 text-xs">{f.description}</p>
          </div>
        ))}
      </div>

      {/* iOS: Add to Home Screen instructions */}
      {ios && (
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
          <h2 className="text-white font-bold text-base mb-4 text-center">
            📲 Install on iPhone
          </h2>
          <div className="flex flex-col gap-3">
            <IOSStep icon={<IoShareOutline size={20} />} n={1}>
              Tap the <span className="font-bold">Share</span> button in Safari's toolbar (bottom of screen)
            </IOSStep>
            <IOSStep icon={<IoAddCircleOutline size={20} />} n={2}>
              Tap <span className="font-bold">"Add to Home Screen"</span>
            </IOSStep>
            <IOSStep icon={<IoPhonePortraitOutline size={20} />} n={3}>
              Tap <span className="font-bold">"Add"</span> — done! Open the icon on your home screen
            </IOSStep>
          </div>
        </div>
      )}

      {/* Android: APK download */}
      {android && (
        <button
          onClick={handleAndroidDownload}
          className="w-full max-w-sm bg-[#8BC34A] text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 mb-3 active:scale-95 transition-transform"
        >
          <IoDownloadOutline size={24} />
          Download APK
        </button>
      )}

      {/* Continue to web */}
      <button
        onClick={handleContinueToWeb}
        className="w-full max-w-sm bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <IoLaptopOutline size={20} />
        Continue to Web Version
      </button>

      {/* Stars */}
      <div className="mt-8 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <IoStarOutline key={i} size={20} className="text-yellow-400" />
        ))}
        <span className="text-white/80 text-sm ml-2">4.8 Rating</span>
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/50 text-xs">RC: 1948976 | © {new Date().getFullYear()} Jibam Pharmacy</p>
      </div>
    </div>
  );
}

function IOSStep({ n, icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-white/20 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-[#8BC34A] flex-shrink-0">{icon}</span>
        <p className="text-white/90 text-sm">{children}</p>
      </div>
    </div>
  );
}
