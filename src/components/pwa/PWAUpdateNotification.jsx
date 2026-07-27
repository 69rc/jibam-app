import { useState, useEffect } from 'react';
import { IoRefreshOutline, IoCloseOutline } from 'react-icons/io5';

export default function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    const handleSWUpdate = (event) => {
      const newSW = event.detail;
      if (newSW && newSW.waiting) {
        setShowUpdate(true);
      }
    };

    // Custom event for service worker updates
    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Tell the waiting service worker to activate
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          // Send message to waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for the controlling service worker change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        }
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-8 sm:w-96">
      <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00AEEF] to-[#0090CC] rounded-xl flex items-center justify-center flex-shrink-0">
            <IoRefreshOutline size={20} className="text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-navy text-sm mb-1">Update Available</h3>
            <p className="text-xs text-gray-500 mb-3">
              A new version of Jibam Pharmacy is available with improvements and bug fixes.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-[#00AEEF] hover:bg-[#0090CC] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <IoRefreshOutline size={14} />
                    Update
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isUpdating}
                className="text-gray-400 hover:text-gray-600 p-2 transition-colors disabled:opacity-50"
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