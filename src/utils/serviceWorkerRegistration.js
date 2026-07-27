/**
 * Service Worker Registration Utility
 * Handles service worker registration, updates, and lifecycle
 * 
 * Note: When using Vite PWA plugin, service worker registration is handled automatically.
 * This utility provides additional functionality for manual control and updates.
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register() {
  if ('serviceWorker' in navigator) {
    console.log('[SW] Service worker is supported');
    
    // The Vite PWA plugin handles registration automatically
    // This is a no-op for development, but we can add custom logic here
    
    console.log('[SW] Service worker registration handled by Vite PWA plugin');
    
    // Add custom update handling
    window.addEventListener('load', () => {
      setupUpdateHandler();
    });
  } else {
    console.log('[SW] Service worker is not supported in this browser');
  }
}

function setupUpdateHandler() {
  // Listen for custom PWA update events from Vite PWA
  window.addEventListener('sw-update-found', () => {
    console.log('[SW] New service worker found');
  });
  
  window.addEventListener('sw-updated', () => {
    console.log('[SW] Service worker updated');
    // Show update notification to user
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

/**
 * Check if a newer version of the service worker is available
 */
export async function checkForUpdate() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return registration;
    }
  }
  return null;
}

/**
 * Force update the service worker
 */
export async function forceUpdate() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}