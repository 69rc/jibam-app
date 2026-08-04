import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoDownloadOutline, IoStarOutline, IoShieldCheckmarkOutline, IoTimeOutline, IoHeartOutline, IoLaptopOutline, IoMedkitOutline } from 'react-icons/io5';

export default function MobileDownloadPage() {
  const navigate = useNavigate();
  const [isAndroid, setIsAndroid] = useState(true);

  const handleDownload = () => {
    // Replace with your actual APK download URL
    const apkUrl = 'https://your-domain.com/jibam-pharmacy.apk';
    window.location.href = apkUrl;
  };

  const handleContinueToWeb = () => {
    // Set localStorage to remember user's preference
    localStorage.setItem('useWebVersion', 'true');
    // Navigate to home page
    navigate('/');
  };

  const features = [
    {
      icon: <IoMedkitOutline size={24} />,
      title: 'Wide Range of Medicines',
      description: 'Access thousands of pharmaceutical products'
    },
    {
      icon: <IoTimeOutline size={24} />,
      title: 'Fast Delivery',
      description: 'Get your medicines delivered quickly to your doorstep'
    },
    {
      icon: <IoShieldCheckmarkOutline size={24} />,
      title: 'Secure Payments',
      description: 'Safe and secure payment options'
    },
    {
      icon: <IoHeartOutline size={24} />,
      title: 'Wishlist & Reorder',
      description: 'Save favorites and easily reorder previous purchases'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B5E20] to-[#2E7D32] flex flex-col items-center justify-center p-6">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="w-28 h-28 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl p-2">
          <img
            src="/icons/logo.PNG"
            alt="Jibam Pharmacy"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Jibam <span className="text-[#8BC34A]">Pharmacy</span>
        </h1>
        <p className="text-white/80 text-sm">Your trusted online pharmacy</p>
      </div>

      {/* App Features */}
      <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
        {features.map((feature, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-[#8BC34A] mb-2 flex justify-center">
              {feature.icon}
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
            <p className="text-white/70 text-xs">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full max-w-sm bg-[#8BC34A] hover:bg-[#0090CC] text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
      >
        <IoDownloadOutline size={24} />
        <span>Download APK</span>
      </button>

      {/* Continue to Web Button */}
      <button
        onClick={handleContinueToWeb}
        className="w-full max-w-sm mt-3 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95"
      >
        <IoLaptopOutline size={20} />
        <span>Continue to Web Version</span>
      </button>

      {/* Platform Toggle */}
      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={() => setIsAndroid(true)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${isAndroid ? 'bg-white text-[#1B5E20]' : 'bg-white/10 text-white/70'}`}
        >
          Android
        </button>
        <button
          onClick={() => setIsAndroid(false)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${!isAndroid ? 'bg-white text-[#1B5E20]' : 'bg-white/10 text-white/70'}`}
        >
          iOS
        </button>
      </div>

      {!isAndroid && (
        <p className="mt-4 text-white/60 text-sm text-center">
          iOS version coming soon!
        </p>
      )}

      {/* Rating */}
      <div className="mt-8 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <IoStarOutline key={i} size={20} className="text-yellow-400 fill-yellow-400" />
        ))}
        <span className="text-white/80 text-sm ml-2">4.8 Rating</span>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-white/50 text-xs">
          RC: 1948976 | © 2024 Jibam Pharmacy
        </p>
      </div>
    </div>
  );
}
