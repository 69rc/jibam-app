/**
 * PWAUpdateNotification
 *
 * Uses vite-plugin-pwa's useRegisterSW hook to detect when a new service
 * worker is waiting. When an update is found:
 *   - A toast-style banner appears at the top of the screen
 *   - User can tap "Update now" to reload immediately
 *   - If ignored, the app auto-reloads after 10 seconds anyway
 *     (so users always get the latest version)
 */
import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { IoRefreshOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export default function PWAUpdateNotification() {
  const toastShown = useRef(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Poll for updates every 60 seconds while the app is open
      if (r) {
        setInterval(() => r.update(), 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[SW] Registration error:', error);
    },
  });

  useEffect(() => {
    if (!needRefresh || toastShown.current) return;
    toastShown.current = true;

    // Show a persistent toast with an update button
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <IoRefreshOutline size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 leading-tight">New version available</p>
            <p className="text-xs text-gray-500">Tap to update Jibam Pharmacy</p>
          </div>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              updateServiceWorker(true);
            }}
            className="flex-shrink-0 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            Update
          </button>
        </div>
      ),
      {
        id: 'pwa-update',
        duration: Infinity, // stays until dismissed or clicked
        position: 'top-center',
        style: {
          maxWidth: '420px',
          padding: '10px 12px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
      }
    );

    // Auto-reload after 10 seconds if user doesn't interact
    const autoReload = setTimeout(() => {
      toast.dismiss('pwa-update');
      updateServiceWorker(true);
    }, 10_000);

    return () => clearTimeout(autoReload);
  }, [needRefresh, updateServiceWorker]);

  return null; // Rendering handled by react-hot-toast
}
